import { Router } from "express";
import { enviarNotificacionRacha } from "../controllers/notificaciones.controller";

const router = Router();

router.post("/enviar-racha", enviarNotificacionRacha);

export default router;
