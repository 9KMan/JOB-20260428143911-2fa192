import { Response, NextFunction } from "express";
import { body, param, query } from "express-validator";
import * as userService from "../services/userService";
import { AuthRequest, TenantRequest } from "../middleware/auth";
import { successResponse } from "../utils/response";

export const createValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("role").optional().isIn(["SUPER_ADMIN", "TENANT_ADMIN", "USER"]).withMessage("Invalid role"),
];

export const updateValidation = [
  param("id").isUUID().withMessage("Valid user ID is required"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("role").optional().isIn(["SUPER_ADMIN", "TENANT_ADMIN", "USER"]).withMessage("Invalid role"),
  body("status").optional().isIn(["ACTIVE", "INACTIVE", "PENDING"]).withMessage("Invalid status"),
];

export const getByIdValidation = [
  param("id").isUUID().withMessage("Valid user ID is required"),
];

export const listValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("status").optional().isIn(["ACTIVE", "INACTIVE", "PENDING"]).withMessage("Invalid status"),
  query("role").optional().isIn(["SUPER_ADMIN", "TENANT_ADMIN", "USER"]).withMessage("Invalid role"),
];

export const changePasswordValidation = [
  param("id").isUUID().withMessage("Valid user ID is required"),
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
];

export const create = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenant?.tenantId || req.user?.tenantId;
    const result = await userService.create({
      ...req.body,
      tenantId,
    });
    res.status(201).json(successResponse(result, "User created successfully"));
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const result = await userService.getById(req.params.id, tenantId);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const list = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenant?.tenantId || req.user?.tenantId;
    const { page = "1", limit = "10", status, role } = req.query;
    const result = await userService.list({
      tenantId,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      status: status as string | undefined,
      role: role as string | undefined,
    });
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const result = await userService.update(req.params.id, tenantId, req.body);
    res.json(successResponse(result, "User updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    await userService.remove(req.params.id, tenantId);
    res.json(successResponse(null, "User deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(userId, currentPassword, newPassword);
    res.json(successResponse(null, "Password changed successfully"));
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    const result = await userService.getById(userId!, tenantId);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
