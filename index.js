import process from 'node:process';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import morgan from 'morgan';
import multer from 'multer';
import CustomError from './helpers/customErrors.js';
import requestLogger from './middlewares/logging.js';
import router from './routes/index.js';

dotenv.config();
const PORT = process.env.PORT;
const DB = process.env.DB_CONNECTION_STRING;
const app = express();
app.use(requestLogger);

app.use(morgan('dev'));

app.use(express.json());

// Enable CORS for all routes
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req, _res) => {
    return req.user ? 200 : 100;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests, please slow down.'
  },
  skip: (req, _res) => {
    const whitelistedIPs = ['123.45.67.89'];
    return whitelistedIPs.includes(req.ip);
  },
  handler: (req, res, _next, options) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  }
});

app.use(limiter);
app.use(router);

app.use((err, _req, res, _next) => {
  if (err instanceof CustomError) {
    return res.status(err.status).json({message: err.message});
  }
  res.status(500).json({message: 'Internal Server Error'});
});

// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:5500'
  })
);

app.use('/uploads', express.static('uploads'));

app.options('*', cors());

// create test route
app.get('/', (_req, res) => {
  res.send('Hello World!');
});

mongoose
  .connect(DB, {})
  .then(() => {
    console.log('DB connection Done!');
  })
  .catch();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
