import { Router } from 'express';
import { getAllMusculos } from '../controllers/musculo.controller';

const router = Router();

router.get('/', getAllMusculos);

export default router;