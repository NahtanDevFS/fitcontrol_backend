import { Router } from "express";
import {
  getDietTrackerForToday,
  getRoutineTrackerForToday,
} from "../controllers/tracker.controller";

const router = Router();

router.get("/dieta/hoy/:id", getDietTrackerForToday);
router.get("/rutina/hoy/:id", getRoutineTrackerForToday);

export default router;
