import { Router } from "express";
import {
  getRutinaDiaEjerciciosUsuario,
  crearRutinaDiaEjercicio,
  actualizarRutinaDiaEjercicio,
  eliminarRutinaDiaEjercicio,
} from "../controllers/rutina_dia_semana_ejercicio.controller";

const router = Router();

router.get("/:id", getRutinaDiaEjerciciosUsuario);
router.post("/", crearRutinaDiaEjercicio);
router.put("/:id", actualizarRutinaDiaEjercicio);
router.delete("/:id", eliminarRutinaDiaEjercicio);

export default router;
