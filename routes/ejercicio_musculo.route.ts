import { Router } from 'express';
import { getAllEjerciciosMusculos } from '../controllers/ejercicio_musculo.controller';

const router = Router();

router.get('/', getAllEjerciciosMusculos);

export default router;