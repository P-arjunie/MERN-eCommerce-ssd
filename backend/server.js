import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import csrf from 'csurf';

dotenv.config({ path: './.env' });

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const port = process.env.PORT || 5000;

// ✅ Connect to MongoDB
connectDB();

const app = express();

app.use(cors());

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// --------------------
// Static files
// --------------------
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------
// API routes
// --------------------
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/auth', authRoutes);



// Optional: fallback for unmatched API routes
app.use('/api', (req, res, next) => {
  res.status(404).json({ message: 'API route not found' });
});

// --------------------
// Frontend (production)
// --------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  // Only redirect non-API requests to index.html
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Hello, World!');
  });
}

// --------------------
// Error handling
// --------------------
app.use(notFound);
app.use(errorHandler);

// --------------------
// Start server
// --------------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
