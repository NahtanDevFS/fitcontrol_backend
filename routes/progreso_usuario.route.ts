import { Router } from "express";
import {
  crearProgresoUsuario,
  actualizarProgresoUsuario,
  getProgresoActivoUsuario,
} from "../controllers/progreso_usuario.controller";

const router = Router();

router.get("/activo/:id", getProgresoActivoUsuario);

router.post("/", crearProgresoUsuario);
router.put("/:id", actualizarProgresoUsuario);

export default router;
