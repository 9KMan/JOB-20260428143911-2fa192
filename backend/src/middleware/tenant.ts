import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { AuthRequest } from "./auth";

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  tenantStatus: string;
  tenantPlan: string;
}

export interface TenantRequest extends Request {
  tenant?: TenantContext;
}

export const tenantContext = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(400).json({ success: false, error: "Tenant context required" });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      res.status(404).json({ success: false, error: "Tenant not found" });
      return;
    }

    if (tenant.status === "SUSPENDED") {
      res.status(403).json({ success: false, error: "Tenant account is suspended" });
      return;
    }

    req.tenant = {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantStatus: tenant.status,
      tenantPlan: tenant.plan,
    };

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to load tenant context" });
  }
};

export const requireActiveTenant = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.tenant) {
    res.status(400).json({ success: false, error: "Tenant context required" });
    return;
  }

  if (req.tenant.tenantStatus !== "ACTIVE") {
    res.status(403).json({ success: false, error: "Tenant is not active" });
    return;
  }

  next();
};

export const requirePlan = (...plans: string[]) => {
  return (req: TenantRequest, res: Response, next: NextFunction): void => {
    if (!req.tenant) {
      res.status(400).json({ success: false, error: "Tenant context required" });
      return;
    }

    if (!plans.includes(req.tenant.tenantPlan)) {
      res.status(403).json({ success: false, error: `Plan ${req.tenant.tenantPlan} not supported for this feature` });
      return;
    }

    next();
  };
};
