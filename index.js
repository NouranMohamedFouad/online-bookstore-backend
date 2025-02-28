import process from "node:process";
// import cors from 'cors';
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
// import router from "./routes/index.js";

dotenv.config();

const app = express();

app.use(express.json());

// app.use(router);

const DB = process.env.DB_CONNECTION_STRING;

mongoose
  .connect(DB, {})
  .then(() => {
    console.log("DB connection Done!");
  })
  .catch();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
