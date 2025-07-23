import { Router } from "express";
import {
  getAlimentoDieta,
  crearDietaAlimento,
  actualizarDietaAlimento,
  eliminarDietaAlimento,
} from "../controllers/dieta_alimento.controller";

const router = Router();

router.get("/:id", getAlimentoDieta);
router.post("/", crearDietaAlimento);
router.put("/:id", actualizarDietaAlimento);
router.delete("/:id", eliminarDietaAlimento);

export default router;
