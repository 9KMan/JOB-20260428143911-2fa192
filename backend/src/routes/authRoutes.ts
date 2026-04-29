import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

router.post(
  "/register",
  validate(authController.registerValidation),
  authController.register
);

router.post(
  "/login",
  validate(authController.loginValidation),
  authController.login
);

router.post(
  "/refresh",
  validate(authController.refreshValidation),
  authController.refresh
);

router.post(
  "/logout",
  authenticate,
  authController.logout
);

router.post(
  "/forgot-password",
  validate(authController.forgotPasswordValidation),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validate(authController.resetPasswordValidation),
  authController.resetPassword
);

export default router;
