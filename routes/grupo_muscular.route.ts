import { Router } from 'express';
import { getAllGruposMusculares } from '../controllers/grupo_muscular.controller';

const router = Router();

router.get('/', getAllGruposMusculares);

export default router;