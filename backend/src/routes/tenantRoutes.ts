import { Router } from "express";
import * as tenantController from "../controllers/tenantController";
import { authenticate } from "../middleware/auth";
import { requireSuperAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  requireSuperAdmin,
  validate(tenantController.createValidation),
  tenantController.create
);

router.get(
  "/",
  requireSuperAdmin,
  validate(tenantController.listValidation),
  tenantController.list
);

router.get(
  "/:id",
  requireSuperAdmin,
  validate(tenantController.getByIdValidation),
  tenantController.getById
);

router.patch(
  "/:id",
  requireSuperAdmin,
  validate(tenantController.updateValidation),
  tenantController.update
);

router.delete(
  "/:id",
  requireSuperAdmin,
  validate(tenantController.getByIdValidation),
  tenantController.remove
);

export default router;
