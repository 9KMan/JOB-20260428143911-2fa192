import prisma from "../config/database";

interface DashboardInput {
  tenantId: string;
  period: string;
}

interface UsageInput {
  tenantId: string;
  period: string;
}

interface ActivityInput {
  tenantId: string;
  page: number;
  limit: number;
  action?: string;
}

const getPeriodStartDate = (period: string): Date => {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

export const dashboard = async (input: DashboardInput) => {
  const { tenantId, period } = input;
  const startDate = getPeriodStartDate(period);

  const [
    totalUsers,
    activeUsers,
    totalLogs,
    recentLogs,
    tenant,
  ] = await Promise.all([
    prisma.user.count({ where: { tenantId } }),
    prisma.user.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.auditLog.count({ where: { tenantId, createdAt: { gte: startDate } } }),
    prisma.auditLog.findMany({
      where: { tenantId, createdAt: { gte: startDate } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        action: true,
        resource: true,
        createdAt: true,
      },
    }),
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
      },
    }),
  ]);

  return {
    tenant,
    period,
    stats: {
      totalUsers,
      activeUsers,
      totalLogs,
    },
    recentActivity: recentLogs,
  };
};

export const usage = async (input: UsageInput) => {
  const { tenantId, period } = input;
  const startDate = getPeriodStartDate(period);

  const [
    totalUsers,
    activeUsers,
    logsByDay,
    logsByAction,
    tenant,
  ] = await Promise.all([
    prisma.user.count({ where: { tenantId } }),
    prisma.user.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM audit_logs
      WHERE tenant_id = ${tenantId} AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
    prisma.auditLog.groupBy({
      by: ["action"],
      where: { tenantId, createdAt: { gte: startDate } },
      _count: { action: true },
    }),
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        plan: true,
      },
    }),
  ]);

  const dailyUsage = logsByDay.map((row) => ({
    date: row.date,
    count: Number(row.count),
  }));

  const actionBreakdown = logsByAction.map((row) => ({
    action: row.action,
    count: row._count.action,
  }));

  return {
    tenantId,
    plan: tenant?.plan,
    period,
    usage: {
      totalUsers,
      activeUsers,
      dailyUsage,
      actionBreakdown,
    },
  };
};

export const activity = async (input: ActivityInput) => {
  const { tenantId, page, limit, action } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { tenantId };

  if (action) {
    where.action = action;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs.map((log) => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      metadata: log.metadata,
      createdAt: log.createdAt,
      userEmail: log.user.email,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
