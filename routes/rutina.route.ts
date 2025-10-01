import { Router } from "express";
import {
  crearRutina,
  eliminarRutina,
  actualizarRutinaCompleta,
  getRutinaById,
  crearRutinaCompleta,
  getRutinasCompletasUsuario,
} from "../controllers/rutina.controller";

const router = Router();

//Rutas Específicas deben ir primero
router.get("/completa/:id", getRutinasCompletasUsuario);
router.post("/completa", crearRutinaCompleta);
router.put("/completa/:id", actualizarRutinaCompleta);

//Rutas Generales
router.post("/", crearRutina);
router.get("/:id", getRutinaById);
router.delete("/:id", eliminarRutina);

export default router;
