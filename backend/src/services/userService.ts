import prisma from "../config/database";
import { OperationalError } from "../middleware/errorHandler";
import { hashPassword, comparePassword } from "../utils/password";

interface CreateUserInput {
  email: string;
  password: string;
  tenantId: string;
  role?: string;
  status?: string;
}

interface UpdateUserInput {
  email?: string;
  role?: string;
  status?: string;
}

interface ListUsersInput {
  tenantId: string | undefined;
  page: number;
  limit: number;
  status?: string;
  role?: string;
}

export const create = async (input: CreateUserInput) => {
  const { email, password, tenantId, role, status } = input;

  const existingUser = await prisma.user.findFirst({
    where: { tenantId, email },
  });

  if (existingUser) {
    throw new OperationalError("User with this email already exists in this tenant", 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      tenantId,
      role: role as "SUPER_ADMIN" | "TENANT_ADMIN" | "USER" || "USER",
      status: status as "ACTIVE" | "INACTIVE" | "PENDING" || "ACTIVE",
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: user.id,
      action: "USER_CREATED",
      resource: "USER",
      metadata: { email },
    },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    tenantId: user.tenantId,
    createdAt: user.createdAt,
  };
};

export const getById = async (id: string, tenantId: string | undefined) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      ...(tenantId && { tenantId }),
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!user) {
    throw new OperationalError("User not found", 404);
  }

  return user;
};

export const list = async (input: ListUsersInput) => {
  const { tenantId, page, limit, status, role } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (tenantId) {
    where.tenantId = tenantId;
  }

  if (status) {
    where.status = status;
  }

  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const update = async (id: string, tenantId: string | undefined, input: UpdateUserInput) => {
  const { email, role, status } = input;

  const user = await prisma.user.findFirst({
    where: {
      id,
      ...(tenantId && { tenantId }),
    },
  });

  if (!user) {
    throw new OperationalError("User not found", 404);
  }

  if (email && email !== user.email) {
    const existingUser = await prisma.user.findFirst({
      where: { tenantId: user.tenantId, email },
    });

    if (existingUser) {
      throw new OperationalError("User with this email already exists in this tenant", 409);
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(email && { email }),
      ...(role && { role: role as "SUPER_ADMIN" | "TENANT_ADMIN" | "USER" }),
      ...(status && { status: status as "ACTIVE" | "INACTIVE" | "PENDING" }),
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId,
      userId: user.id,
      action: "USER_UPDATED",
      resource: "USER",
      metadata: { changes: input },
    },
  });

  return {
    id: updated.id,
    email: updated.email,
    role: updated.role,
    status: updated.status,
    tenantId: updated.tenantId,
  };
};

export const remove = async (id: string, tenantId: string | undefined) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      ...(tenantId && { tenantId }),
    },
  });

  if (!user) {
    throw new OperationalError("User not found", 404);
  }

  await prisma.user.delete({
    where: { id },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId,
      userId: id,
      action: "USER_DELETED",
      resource: "USER",
      metadata: { deletedEmail: user.email },
    },
  });

  return { deleted: true };
};

export const changePassword = async (id: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new OperationalError("User not found", 404);
  }

  const isValidPassword = await comparePassword(currentPassword, user.passwordHash);

  if (!isValidPassword) {
    throw new OperationalError("Current password is incorrect", 401);
  }

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id },
    data: { passwordHash: newPasswordHash },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId,
      userId: user.id,
      action: "PASSWORD_CHANGED",
      resource: "USER",
    },
  });

  return { success: true };
};
