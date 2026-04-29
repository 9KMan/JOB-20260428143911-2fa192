import { Response, NextFunction } from "express";
import { body } from "express-validator";
import * as authService from "../services/authService";
import { AuthRequest } from "../middleware/auth";
import { successResponse } from "../utils/response";

export const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("tenantName").notEmpty().trim().withMessage("Tenant name is required"),
  body("tenantSlug").matches(/^[a-z0-9-]+$/).withMessage("Slug must be lowercase alphanumeric with hyphens"),
];

export const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const refreshValidation = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

export const forgotPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
];

export const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, tenantName, tenantSlug } = req.body;
    const result = await authService.register({
      email,
      password,
      tenantName,
      tenantSlug,
    });
    res.status(201).json(successResponse(result, "Registration successful"));
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(successResponse(result, "Login successful"));
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(successResponse(result, "Token refreshed"));
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    await authService.logout(userId);
    res.json(successResponse(null, "Logout successful"));
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json(successResponse(null, "If the email exists, a reset link has been sent"));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.json(successResponse(null, "Password reset successful"));
  } catch (error) {
    next(error);
  }
};
