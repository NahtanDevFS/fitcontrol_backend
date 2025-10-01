import { Router } from "express";
import { getEjerciciosByMusculo } from "../controllers/ejercicio.controller";

const router = Router();

router.get("/musculo/:id_musculo", getEjerciciosByMusculo);

export default router;
