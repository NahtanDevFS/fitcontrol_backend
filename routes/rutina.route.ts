import { Router } from 'express';
import { getRutinaUsuario, crearRutina, actualizarRutina } from '../controllers/rutina.controller';

const router = Router();

router.get('/:id', getRutinaUsuario);
router.post('/', crearRutina);
router.put('/:id', actualizarRutina);

export default router;