import { Router } from "express";
import { getProfileData } from "../controllers/perfil.controller";

const router = Router();

router.get("/:id", getProfileData);

export default router;
