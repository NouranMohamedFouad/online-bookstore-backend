import process from 'node:process';
// import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import CustomError from './helpers/customErrors.js';
import requestLogger from './middlewares/logging.js';
import router from './routes/index.js';

dotenv.config();
const PORT = process.env.PORT;
const DB = process.env.DB_CONNECTION_STRING;
const app = express();

app.use(express.json());

app.use(router);

app.use((err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.status).json({message: err.message});
  }
  res.status(500).json({message: 'Internal Server Error'});
});

// create test route
app.use(requestLogger);
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
