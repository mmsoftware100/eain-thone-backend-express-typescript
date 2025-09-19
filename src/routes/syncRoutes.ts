import express from 'express';
import {
  bulkCreateTransactions,
  bulkUpdateTransactions,
  getUnsyncedTransactions,
  markTransactionsSynced,
  getSyncStatus,
} from '../controllers/syncController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/transactions', bulkCreateTransactions);
router.put('/transactions', bulkUpdateTransactions);
router.get('/unsynced', getUnsyncedTransactions);
router.patch('/mark-synced', markTransactionsSynced);
router.get('/status', getSyncStatus);

export default router;