import { config } from "../config";
import prisma from "../config/database";
import { OperationalError } from "../middleware/errorHandler";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { hashPassword, comparePassword } from "../utils/password";

interface RegisterInput {
  email: string;
  password: string;
  tenantName: string;
  tenantSlug: string;
}

export const register = async (input: RegisterInput) => {
  const { email, password, tenantName, tenantSlug } = input;

  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (existingUser) {
    throw new OperationalError("User with this email already exists", 409);
  }

  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (existingTenant) {
    throw new OperationalError("Tenant with this slug already exists", 409);
  }

  const passwordHash = await hashPassword(password);

  const tenant = await prisma.tenant.create({
    data: {
      name: tenantName,
      slug: tenantSlug,
      status: "PENDING",
      plan: "STARTER",
    },
  });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      tenantId: tenant.id,
      role: "SUPER_ADMIN",
      status: "PENDING",
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      action: "USER_REGISTERED",
      resource: "USER",
      metadata: { email },
    },
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    tenantId: tenant.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    tenantId: tenant.id,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      plan: tenant.plan,
    },
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: { email },
    include: { tenant: true },
  });

  if (!user) {
    throw new OperationalError("Invalid email or password", 401);
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);

  if (!isValidPassword) {
    throw new OperationalError("Invalid email or password", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new OperationalError("User account is not active", 403);
  }

  if (user.tenant.status === "SUSPENDED") {
    throw new OperationalError("Tenant account is suspended", 403);
  }

  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId,
      userId: user.id,
      action: "USER_LOGIN",
      resource: "USER",
      metadata: { email },
    },
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    tenant: {
      id: user.tenant.id,
      name: user.tenant.name,
      slug: user.tenant.slug,
    },
  };
};

export const refresh = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new OperationalError("Invalid or expired refresh token", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new OperationalError("User not found or not active", 401);
  }

  await prisma.refreshToken.delete({
    where: { id: storedToken.id },
  });

  const newAccessToken = generateAccessToken({
    userId: user.id,
    tenantId: payload.tenantId,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({
    userId: user.id,
    tenantId: payload.tenantId,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (userId: string | undefined) => {
  if (!userId) {
    return;
  }

  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: "",
      userId,
      action: "USER_LOGOUT",
      resource: "USER",
    },
  });
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    return;
  }

  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId,
      userId: user.id,
      action: "PASSWORD_FORGOT",
      resource: "USER",
      metadata: { email },
    },
  });
};

export const resetPassword = async (token: string, newPassword: string) => {
  throw new OperationalError("Password reset is not fully implemented - requires email token flow", 501);
};
