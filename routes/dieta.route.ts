import { Router } from "express";
import {
  getDietasUsuario,
  crearDieta,
  actualizarDieta,
  eliminarDieta,
} from "../controllers/dieta.controller";

const router = Router();

router.get("/:id", getDietasUsuario);
router.post("/", crearDieta);
router.put("/:id", actualizarDieta);
router.delete("/:id", eliminarDieta);

export default router;
