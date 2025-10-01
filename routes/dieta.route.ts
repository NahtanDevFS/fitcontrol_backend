import { Router } from "express";
import { getDietaCompletaUsuario } from "../controllers/dieta.controller";

const router = Router();

router.get("/completa/:id", getDietaCompletaUsuario);

export default router;
