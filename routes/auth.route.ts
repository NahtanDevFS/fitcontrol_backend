// src/routes/authRoutes.ts
import express from "express";
import {
  registrarUsuario,
  autenticarUsuario,
  cerrarSesion,
  obtenerUsuarioActual,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/registro", registrarUsuario);
router.post("/login", autenticarUsuario);
router.post("/logout", cerrarSesion);
router.get("/usuario", obtenerUsuarioActual);

export default router;
