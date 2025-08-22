// src/routes/authRoutes.ts
import express from "express";
import {
  registrarUsuario,
  autenticarUsuario,
  cerrarSesion,
  obtenerUsuarioActual,
  autenticarMiddleware,
  solicitarReseteoPassword,
  actualizarPasswordUsuario,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/registro", registrarUsuario);
router.post("/login", autenticarUsuario);
router.post("/logout", cerrarSesion);
router.get("/usuario", obtenerUsuarioActual);

// Ruta pública para que cualquiera pueda solicitar un reseteo
router.post("/reset-password", solicitarReseteoPassword);

// Ruta protegida. Solo un usuario con una sesión válida (del token del email) puede acceder.
router.post(
  "/update-password",
  autenticarMiddleware,
  actualizarPasswordUsuario
);

export default router;
