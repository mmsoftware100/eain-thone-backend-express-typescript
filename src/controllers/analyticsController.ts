import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { IUser } from '../models/User';

// @desc    Get financial summary
// @route   GET /api/v1/analytics/summary
// @access  Private
export const getSummary = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    const userId = req.user?._id;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        dateFilter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        dateFilter.date.$lte = new Date(endDate as string);
      }
    }

    const matchStage = { userId, ...dateFilter };

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    summary.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.total;
        incomeCount = item.count;
      } else if (item._id === 'expense') {
        totalExpense = item.total;
        expenseCount = item.count;
      }
    });

    const balance = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        incomeCount,
        expenseCount,
        totalTransactions: incomeCount + expenseCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get spending by category
// @route   GET /api/v1/analytics/categories
// @access  Private
export const getCategoryBreakdown = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    const userId = req.user?._id;
    const { startDate, endDate, type = 'expense' } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        dateFilter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        dateFilter.date.$lte = new Date(endDate as string);
      }
    }

    const matchStage = { userId, type, ...dateFilter };

    const categoryBreakdown = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get monthly trends
// @route   GET /api/v1/analytics/trends
// @access  Private
export const getMonthlyTrends = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    const userId = req.user?._id;
    const { year = new Date().getFullYear() } = req.query;

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const trends = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.month',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0],
            },
          },
          incomeCount: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$count', 0],
            },
          },
          expenseCount: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$count', 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing months with zero values
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const fullYearData = monthNames.map((month, index) => {
      const monthData = trends.find(t => t._id === index + 1);
      return {
        month,
        monthNumber: index + 1,
        income: monthData?.income || 0,
        expense: monthData?.expense || 0,
        balance: (monthData?.income || 0) - (monthData?.expense || 0),
        incomeCount: monthData?.incomeCount || 0,
        expenseCount: monthData?.expenseCount || 0,
      };
    });

    res.status(200).json({
      success: true,
      data: fullYearData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};