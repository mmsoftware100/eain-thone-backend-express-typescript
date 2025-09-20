import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import itemRoutes from './routes/itemRoutes';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import syncRoutes from './routes/syncRoutes';
import categoryRoutes from './routes/categoryRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    // Add Flutter app domain when deployed
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 5 requests per windowMs for auth
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());

// Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/items', itemRoutes); // Keep existing items API for backward compatibility

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;