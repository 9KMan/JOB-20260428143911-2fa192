import { Response, NextFunction } from "express";
import { body, param, query } from "express-validator";
import * as tenantService from "../services/tenantService";
import { AuthRequest } from "../middleware/auth";
import { successResponse } from "../utils/response";

export const createValidation = [
  body("name").notEmpty().trim().withMessage("Tenant name is required"),
  body("slug").matches(/^[a-z0-9-]+$/).withMessage("Slug must be lowercase alphanumeric with hyphens"),
  body("plan").optional().isIn(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).withMessage("Invalid plan"),
];

export const updateValidation = [
  param("id").isUUID().withMessage("Valid tenant ID is required"),
  body("name").optional().notEmpty().trim().withMessage("Tenant name cannot be empty"),
  body("plan").optional().isIn(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).withMessage("Invalid plan"),
  body("status").optional().isIn(["ACTIVE", "SUSPENDED", "PENDING"]).withMessage("Invalid status"),
];

export const getByIdValidation = [
  param("id").isUUID().withMessage("Valid tenant ID is required"),
];

export const listValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("status").optional().isIn(["ACTIVE", "SUSPENDED", "PENDING"]).withMessage("Invalid status"),
];

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await tenantService.create(req.body);
    res.status(201).json(successResponse(result, "Tenant created successfully"));
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
    const result = await tenantService.getById(req.params.id);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const list = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = "1", limit = "10", status } = req.query;
    const result = await tenantService.list({
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      status: status as string | undefined,
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
    const result = await tenantService.update(req.params.id, req.body);
    res.json(successResponse(result, "Tenant updated successfully"));
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
    await tenantService.remove(req.params.id);
    res.json(successResponse(null, "Tenant deleted successfully"));
  } catch (error) {
    next(error);
  }
};
