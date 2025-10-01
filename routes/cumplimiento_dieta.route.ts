import { Router } from "express";
import { actualizarCumplimientoDieta } from "../controllers/cumplimiento_dieta.controller";

const router = Router();

router.put("/:id", actualizarCumplimientoDieta);

export default router;
