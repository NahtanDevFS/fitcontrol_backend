// fitcontrol_backend/routes/tracker.route.ts

import { Router } from "express";
import { getDietTrackerForToday } from "../controllers/tracker.controller";

const router = Router();

router.get("/dieta/hoy/:id", getDietTrackerForToday);

export default router;
