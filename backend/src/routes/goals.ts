import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goalController';

const router = Router();
router.use(authenticate);

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
