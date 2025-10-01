import { Router } from "express";
import { actualizarCumplimientoRutina } from "../controllers/cumplimiento_rutina.controller";

const router = Router();

router.put("/:id", actualizarCumplimientoRutina);

export default router;
