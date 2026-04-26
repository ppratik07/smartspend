import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  checkBudgetAlerts,
} from '../controllers/budgetController';

const router = Router();
router.use(authenticate);

router.get('/', getBudgets);
router.get('/alerts', checkBudgetAlerts);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
