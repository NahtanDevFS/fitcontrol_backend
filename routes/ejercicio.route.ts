import { Router } from 'express';
import { getAllEjercicios } from '../controllers/ejercicio.controller';

const router = Router();

router.get('/', getAllEjercicios);

export default router;