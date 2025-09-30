import { Router } from "express";
import {
  getGastoEnergetico,
  upsertGastoEnergetico,
} from "../controllers/gasto_energetico.controller";

const router = Router();

router.get("/:id", getGastoEnergetico);
router.post("/", upsertGastoEnergetico); //Usamos POST para crear/actualizar

export default router;
