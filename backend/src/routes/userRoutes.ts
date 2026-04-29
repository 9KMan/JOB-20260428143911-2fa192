import { Router } from "express";
import * as userController from "../controllers/userController";
import { authenticate, requireTenantAdmin } from "../middleware/auth";
import { tenantContext } from "../middleware/tenant";
import { validate } from "../middleware/validate";

const router = Router();

router.use(authenticate);
router.use(tenantContext);

router.post(
  "/",
  requireTenantAdmin,
  validate(userController.createValidation),
  userController.create
);

router.get(
  "/",
  validate(userController.listValidation),
  userController.list
);

router.get(
  "/profile",
  userController.getProfile
);

router.get(
  "/:id",
  validate(userController.getByIdValidation),
  userController.getById
);

router.patch(
  "/:id",
  validate(userController.updateValidation),
  userController.update
);

router.delete(
  "/:id",
  validate(userController.getByIdValidation),
  userController.remove
);

router.post(
  "/:id/change-password",
  validate(userController.changePasswordValidation),
  userController.changePassword
);

export default router;
