import { Router } from "express";
import {
  getRutinaUsuario,
  crearRutina,
  actualizarRutina,
  eliminarRutina,
  actualizarRutinaCompleta,
} from "../controllers/rutina.controller";

const router = Router();

router.get("/:id", getRutinaUsuario);
router.post("/", crearRutina);
router.put("/:id", actualizarRutina);
router.delete("/:id", eliminarRutina);
router.put("/completa/:id", actualizarRutinaCompleta);

export default router;
