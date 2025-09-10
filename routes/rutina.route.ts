// routes/rutina.route.ts
import { Router } from "express";
import {
  getRutinaUsuario,
  crearRutina,
  actualizarRutina,
  eliminarRutina,
  actualizarRutinaCompleta,
  getRutinaById,
  crearRutinaCompleta,
  getRutinasCompletasUsuario,
} from "../controllers/rutina.controller";

const router = Router();

// --- Rutas Específicas (deben ir primero) ---
router.get("/completa/:id", getRutinasCompletasUsuario);
router.get("/usuario/:id", getRutinaUsuario);
router.post("/completa", crearRutinaCompleta); // <-- NUEVA RUTA para crear
router.put("/completa/:id", actualizarRutinaCompleta);

// --- Rutas Generales ---
router.post("/", crearRutina);
router.get("/:id", getRutinaById);
router.put("/:id", actualizarRutina);
router.delete("/:id", eliminarRutina);

export default router;
