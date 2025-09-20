import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

// @desc    Bulk create transactions
// @route   POST /api/v1/sync/transactions
// @access  Private
export const bulkCreateTransactions = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    const { transactions } = req.body;
    const userId = req.user?._id;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of transactions',
      });
    }

    // Add userId to each transaction and validate
    const transactionsWithUser = transactions.map((transaction) => ({
      ...transaction,
      userId,
      isSynced: true,
    }));

    // Use insertMany for bulk operation
    const createdTransactions = await Transaction.insertMany(
      transactionsWithUser,
      { ordered: false } // Continue inserting even if some fail
    );

    res.status(201).json({
      success: true,
      count: createdTransactions.length,
      data: createdTransactions,
    });
  } catch (error: any) {
    // Handle bulk write errors
    if (error.name === 'BulkWriteError') {
      const successfulInserts = error.result.insertedCount;
      const errors = error.writeErrors.map((err: any) => ({
        index: err.index,
        error: err.errmsg,
      }));

      return res.status(207).json({
        success: true,
        message: 'Partial success',
        successfulInserts,
        errors,
      });
    }

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        error: message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Bulk update transactions
// @route   PUT /api/v1/sync/transactions
// @access  Private
export const bulkUpdateTransactions = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    const { transactions } = req.body;
    const userId = req.user?._id;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of transactions',
      });
    }

    const bulkOps = transactions.map((transaction) => ({
      updateOne: {
        filter: { _id: transaction._id, userId },
        update: { $set: { ...transaction, isSynced: true } },
        upsert: false,
      },
    }));

    const result = await Transaction.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      data: result,
    });
  } catch (error: any) {
    if (error.name === 'BulkWriteError') {
      const errors = error.writeErrors.map((err: any) => ({
        index: err.index,
        error: err.errmsg,
      }));

      return res.status(207).json({
        success: true,
        message: 'Partial success',
        modifiedCount: error.result.modifiedCount,
        errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get unsynced transactions
// @route   GET /api/v1/sync/unsynced
// @access  Private
export const getUnsyncedTransactions = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    const userId = req.user?._id;

    const unsyncedTransactions = await Transaction.find({
      userId,
      isSynced: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: unsyncedTransactions.length,
      data: unsyncedTransactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Mark transactions as synced
// @route   PATCH /api/v1/sync/mark-synced
// @access  Private
export const markTransactionsSynced = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    const { transactionIds } = req.body;
    const userId = req.user?._id;

    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of transaction IDs',
      });
    }

    // Validate ObjectIds
    const validIds = transactionIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid transaction IDs provided',
      });
    }

    const result = await Transaction.updateMany(
      {
        _id: { $in: validIds },
        userId,
      },
      { $set: { isSynced: true } }
    );

    res.status(200).json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get sync status
// @route   GET /api/v1/sync/status
// @access  Private
export const getSyncStatus = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    const userId = req.user?._id;

    const [totalCount, syncedCount, unsyncedCount] = await Promise.all([
      Transaction.countDocuments({ userId }),
      Transaction.countDocuments({ userId, isSynced: true }),
      Transaction.countDocuments({ userId, isSynced: false }),
    ]);

    const syncPercentage = totalCount > 0 ? (syncedCount / totalCount) * 100 : 100;

    res.status(200).json({
      success: true,
      data: {
        totalTransactions: totalCount,
        syncedTransactions: syncedCount,
        unsyncedTransactions: unsyncedCount,
        syncPercentage: Math.round(syncPercentage * 100) / 100,
        lastSyncAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};