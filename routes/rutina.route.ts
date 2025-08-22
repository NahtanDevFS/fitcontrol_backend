import { Router } from "express";
import {
  getRutinaUsuario,
  crearRutina,
  actualizarRutina,
  eliminarRutina,
  actualizarRutinaCompleta,
  getRutinaById,
} from "../controllers/rutina.controller";

const router = Router();

// --- Rutas Específicas (deben ir primero) ---

// Obtiene TODAS las rutinas de un USUARIO específico
router.get("/usuario/:id", getRutinaUsuario);

// Actualiza una rutina COMPLETA (días y ejercicios)
router.put("/completa/:id", actualizarRutinaCompleta);

// --- Rutas Generales ---

// Crea una nueva rutina
router.post("/", crearRutina);

// Obtiene, actualiza o elimina UNA rutina por su propio ID
router.get("/:id", getRutinaById);
router.put("/:id", actualizarRutina);
router.delete("/:id", eliminarRutina);

export default router;
