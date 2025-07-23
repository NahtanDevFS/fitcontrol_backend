import { Router } from "express";
import {
  getCumplimientosDietaUsuario,
  crearCumplimientoDieta,
  actualizarCumplimientoDieta,
  eliminarCumplimientoDieta,
} from "../controllers/cumplimiento_dieta.controller";

const router = Router();

router.get("/:id", getCumplimientosDietaUsuario);
router.post("/", crearCumplimientoDieta);
router.put("/:id", actualizarCumplimientoDieta);
router.delete("/:id", eliminarCumplimientoDieta);

export default router;
