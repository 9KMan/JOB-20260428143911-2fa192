import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import prisma from "../config/database";

export interface AuthPayload {
  userId: string;
  tenantId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwt.secret) as AuthPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tenant: true },
    });

    if (!user) {
      res.status(401).json({ success: false, error: "User not found" });
      return;
    }

    if (user.status !== "ACTIVE") {
      res.status(403).json({ success: false, error: "User account is not active" });
      return;
    }

    req.user = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: "Token expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: "Invalid token" });
      return;
    }
    res.status(500).json({ success: false, error: "Authentication failed" });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: "Insufficient permissions" });
      return;
    }

    next();
  };
};

export const requireSuperAdmin = requireRole("SUPER_ADMIN");
export const requireTenantAdmin = requireRole("SUPER_ADMIN", "TENANT_ADMIN");
