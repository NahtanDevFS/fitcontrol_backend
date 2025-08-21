import { Router } from "express";
import {
  getRutinaUsuario,
  crearRutina,
  actualizarRutina,
  eliminarRutina,
} from "../controllers/rutina.controller";

const router = Router();

router.get("/:id", getRutinaUsuario);
router.post("/", crearRutina);
router.put("/:id", actualizarRutina);
router.delete("/:id", eliminarRutina);

export default router;
