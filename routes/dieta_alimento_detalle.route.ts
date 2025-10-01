import { Router } from "express";
import {
  crearDetalleAlimento,
  actualizarDetalleAlimento,
  eliminarDetalleAlimento,
} from "../controllers/dieta_alimento_detalle.controller";

const router = Router();

router.post("/", crearDetalleAlimento);
router.put("/:id", actualizarDetalleAlimento);
router.delete("/:id", eliminarDetalleAlimento);

export default router;
