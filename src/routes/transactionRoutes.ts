import express from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/').get(getTransactions).post(createTransaction);
router
  .route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;