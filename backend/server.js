import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import csrf from 'csurf';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

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

//FIX: Added this line to disable X-Powered-By header
app.disable('x-powered-by');

//FIX: Added this - Content Security Policy (CSP) Header Configuration
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' https://checkout.razorpay.com 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.razorpay.com;"
  );
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false // For development
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

/*const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts, please try again later.'
});
*/

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests
  handler: (req, res, next) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again later.'
    });
  },
});
// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/v1/users/login', loginLimiter);

app.use(cors());

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// --------------------
// Static files
// --------------------
const __dirname = path.resolve();
// 🔒 SECURE: Custom middleware to block array-based NoSQL injection
app.use((req, res, next) => {
  // Check for array parameters in query string which could be NoSQL injection attempts
  for (const [key, value] of Object.entries(req.query)) {
    if (Array.isArray(value)) {
      console.warn(`🚨 Array-based NoSQL injection attempt blocked: ${key}[] in ${req.method} ${req.path} from IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameter format detected'
      });
    }
    // Also check for objects that might be injection attempts
    if (typeof value === 'object' && value !== null) {
      console.warn(`🚨 Object-based NoSQL injection attempt blocked: ${key} in ${req.method} ${req.path} from IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameter format detected'
      });
    }
  }
  next();
});

// 🔒 SECURE: Add NoSQL injection protection middleware
app.use(mongoSanitize({
  replaceWith: '_', // Replace prohibited characters with underscore
  onSanitize: ({ req, key }) => {
    console.warn(`🚨 NoSQL injection attempt detected: ${key} in ${req.method} ${req.path} from IP: ${req.ip}`);
  }
}));

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
