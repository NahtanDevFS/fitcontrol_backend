import { Router } from "express";
import {
  getCumplimientosRutina,
  crearCumplimientoRutina,
  actualizarCumplimientoRutina,
  eliminarCumplimientoRutina,
} from "../controllers/cumplimiento_rutina.controller";

const router = Router();

router.get("/:id", getCumplimientosRutina);
router.post("/", crearCumplimientoRutina);
router.put("/:id", actualizarCumplimientoRutina);
router.delete("/:id", eliminarCumplimientoRutina);

export default router;
