import { Router } from "express";
import {
  getAllEjercicios,
  getEjerciciosByMusculo,
} from "../controllers/ejercicio.controller";

const router = Router();

router.get("/", getAllEjercicios);
router.get("/musculo/:id_musculo", getEjerciciosByMusculo);

export default router;
