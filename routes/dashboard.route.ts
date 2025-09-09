// fitcontrol_backend/routes/dashboard.route.ts

import { Router } from "express";
import { getDashboardData } from "../controllers/dashboard.controller";

const router = Router();

router.get("/:id", getDashboardData);

export default router;
