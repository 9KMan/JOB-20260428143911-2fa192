import { Response, NextFunction } from "express";
import { query } from "express-validator";
import * as analyticsService from "../services/analyticsService";
import { TenantRequest } from "../middleware/auth";
import { successResponse } from "../utils/response";

export const dashboardValidation = [
  query("period").optional().isIn(["7d", "30d", "90d"]).withMessage("Period must be 7d, 30d, or 90d"),
];

export const usageValidation = [
  query("period").optional().isIn(["7d", "30d", "90d"]).withMessage("Period must be 7d, 30d, or 90d"),
];

export const activityValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("action").optional().isString(),
];

export const dashboard = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenant?.tenantId || req.user?.tenantId;
    const { period = "30d" } = req.query;
    const result = await analyticsService.dashboard(tenantId!, period as string);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const usage = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenant?.tenantId || req.user?.tenantId;
    const { period = "30d" } = req.query;
    const result = await analyticsService.usage(tenantId!, period as string);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const activity = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenant?.tenantId || req.user?.tenantId;
    const { page = "1", limit = "20", action } = req.query;
    const result = await analyticsService.activity(tenantId!, {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      action: action as string | undefined,
    });
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
