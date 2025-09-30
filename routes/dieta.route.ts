import { Router } from "express";
import {
  //getDietasUsuario,
  //crearDieta,
  //actualizarDieta,
  //eliminarDieta,
  getDietaCompletaUsuario,
} from "../controllers/dieta.controller";

const router = Router();

router.get("/completa/:id", getDietaCompletaUsuario);
//router.get("/:id", getDietasUsuario);

//router.post("/", crearDieta);
//router.put("/:id", actualizarDieta);
//router.delete("/:id", eliminarDieta);

export default router;
