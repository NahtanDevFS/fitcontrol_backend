import { Router } from "express";
import {
  getDetalleAlimentoDieta,
  crearDetalleAlimento,
  actualizarDetalleAlimento,
  eliminarDetalleAlimento,
} from "../controllers/dieta_alimento_detalle.controller";

const router = Router();

router.get("/:id", getDetalleAlimentoDieta);
router.post("/", crearDetalleAlimento);
router.put("/:id", actualizarDetalleAlimento);
router.delete("/:id", eliminarDetalleAlimento);

export default router;
