import process from 'node:process';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
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

app.use(router);

app.use((err, req, res, next) => {
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
app.get('/', (req, res) => {
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
