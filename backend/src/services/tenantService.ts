import prisma from "../config/database";
import { OperationalError } from "../middleware/errorHandler";

interface CreateTenantInput {
  name: string;
  slug: string;
  plan?: string;
}

interface UpdateTenantInput {
  name?: string;
  plan?: string;
  status?: string;
}

interface ListTenantsInput {
  page: number;
  limit: number;
  status?: string;
}

export const create = async (input: CreateTenantInput) => {
  const { name, slug, plan } = input;

  const existingTenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  if (existingTenant) {
    throw new OperationalError("Tenant with this slug already exists", 409);
  }

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      plan: plan as "STARTER" | "PROFESSIONAL" | "ENTERPRISE" || "STARTER",
      status: "ACTIVE",
    },
  });

  return tenant;
};

export const getById = async (id: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  if (!tenant) {
    throw new OperationalError("Tenant not found", 404);
  }

  return {
    ...tenant,
    userCount: tenant._count.users,
  };
};

export const list = async (input: ListTenantsInput) => {
  const { page, limit, status } = input;
  const skip = (page - 1) * limit;

  const where = status ? { status: status as "ACTIVE" | "SUSPENDED" | "PENDING" } : {};

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true },
        },
      },
    }),
    prisma.tenant.count({ where }),
  ]);

  return {
    data: tenants.map((tenant) => ({
      ...tenant,
      userCount: tenant._count.users,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const update = async (id: string, input: UpdateTenantInput) => {
  const { name, plan, status } = input;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
  });

  if (!tenant) {
    throw new OperationalError("Tenant not found", 404);
  }

  const updated = await prisma.tenant.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(plan && { plan: plan as "STARTER" | "PROFESSIONAL" | "ENTERPRISE" }),
      ...(status && { status: status as "ACTIVE" | "SUSPENDED" | "PENDING" }),
    },
  });

  return updated;
};

export const remove = async (id: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
  });

  if (!tenant) {
    throw new OperationalError("Tenant not found", 404);
  }

  await prisma.tenant.delete({
    where: { id },
  });

  return { deleted: true };
};
