import { Router } from "express";
import {
  getAllUsuarios,
  actualizarUsuario,
} from "../controllers/usuario.controller";

const router = Router();

router.get("/", getAllUsuarios);
router.put("/:id", actualizarUsuario);

export default router;
