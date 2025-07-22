import { Router } from 'express';
import { getAllUsuarios, crearUsuario, actualizarUsuario } from '../controllers/usuario.controller';

const router = Router();

router.get('/', getAllUsuarios);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);

export default router;