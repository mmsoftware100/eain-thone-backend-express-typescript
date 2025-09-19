import express from 'express';
import {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
} from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/trends', getMonthlyTrends);

export default router;