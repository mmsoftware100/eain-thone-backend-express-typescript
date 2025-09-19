import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  userId: mongoose.Types.ObjectId;
  isSynced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
      maxlength: [200, 'Description cannot be more than 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
      maxlength: [50, 'Category cannot be more than 50 characters'],
    },
    type: {
      type: String,
      required: [true, 'Please specify transaction type'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense',
      },
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    isSynced: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, category: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);