import { Router } from "express";
import {
  getAllMusculos,
  getMusculosByGrupo,
} from "../controllers/musculo.controller";

const router = Router();

router.get("/", getAllMusculos);
router.get("/grupo/:id_grupo", getMusculosByGrupo);

export default router;
