import { Router } from "express";
import * as analyticsController from "../controllers/analyticsController";
import { authenticate } from "../middleware/auth";
import { tenantContext } from "../middleware/tenant";
import { validate } from "../middleware/validate";

const router = Router();

router.use(authenticate);
router.use(tenantContext);

router.get(
  "/dashboard",
  validate(analyticsController.dashboardValidation),
  analyticsController.dashboard
);

router.get(
  "/usage",
  validate(analyticsController.usageValidation),
  analyticsController.usage
);

router.get(
  "/activity",
  validate(analyticsController.activityValidation),
  analyticsController.activity
);

export default router;
