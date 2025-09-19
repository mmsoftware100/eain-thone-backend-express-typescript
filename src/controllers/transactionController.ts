import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

// @desc    Get all transactions for logged in user
// @route   GET /api/v1/transactions
// @access  Private
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, type, category, startDate, endDate } = req.query;
    const userId = req.user?._id;

    // Build query
    const query: any = { userId };

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate as string);
      }
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get single transaction
// @route   GET /api/v1/transactions/:id
// @access  Private
export const getTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/v1/transactions
// @access  Private
export const createTransaction = async (req: Request, res: Response) => {
  try {
    // Add user to req.body
    req.body.userId = req.user?._id;

    const transaction = await Transaction.create(req.body);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
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

// @desc    Update transaction
// @route   PUT /api/v1/transactions/:id
// @access  Private
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
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

// @desc    Delete transaction
// @route   DELETE /api/v1/transactions/:id
// @access  Private
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};