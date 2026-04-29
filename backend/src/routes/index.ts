import { Router } from "express";
import authRoutes from "./authRoutes";
import tenantRoutes from "./tenantRoutes";
import userRoutes from "./userRoutes";
import analyticsRoutes from "./analyticsRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tenants", tenantRoutes);
router.use("/users", userRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
