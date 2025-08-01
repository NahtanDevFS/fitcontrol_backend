import { Router } from "express";
import {
  getProgresoUsuario,
  crearProgresoUsuario,
  actualizarProgresoUsuario,
  eliminarProgresoUsuario,
} from "../controllers/progreso_usuario.controller";

const router = Router();

router.get("/:id", getProgresoUsuario);
router.post("/", crearProgresoUsuario);
router.put("/:id", actualizarProgresoUsuario);
router.delete("/:id", eliminarProgresoUsuario);

export default router;
