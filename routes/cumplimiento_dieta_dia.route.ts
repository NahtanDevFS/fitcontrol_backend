// fitcontrol_backend/routes/cumplimiento_dieta_dia.route.ts

import { Router } from "express";
import { actualizarCumplimientoDia } from "../controllers/cumplimiento_dieta_dia.controller";

const router = Router();

router.put("/:id", actualizarCumplimientoDia);

export default router;
