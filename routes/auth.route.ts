import express from "express";
import {
  registrarUsuario,
  autenticarUsuario,
  cerrarSesion,
  solicitarReseteoPassword,
  actualizarPasswordUsuario,
  handleGoogleCallback,
} from "../controllers/auth.controller";

const router = express.Router();

router.get("/google/callback", handleGoogleCallback);
router.post("/registro", registrarUsuario);
router.post("/login", autenticarUsuario);
router.post("/logout", cerrarSesion);

//Ruta pública para que cualquiera pueda solicitar un reseteo
router.post("/reset-password", solicitarReseteoPassword);

//Ruta protegida, solo un usuario con una sesión válida (del token del email) puede acceder
router.post("/update-password", actualizarPasswordUsuario);

export default router;
