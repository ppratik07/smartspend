import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getSummary, getTrend, getCategoryBreakdown } from '../controllers/reportController';

const router = Router();
router.use(authenticate);

router.get('/summary', getSummary);
router.get('/trend', getTrend);
router.get('/categories', getCategoryBreakdown);

export default router;
