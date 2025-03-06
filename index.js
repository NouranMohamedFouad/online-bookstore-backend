import {createServer} from 'node:http';
import process from 'node:process';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import morgan from 'morgan';
import multer from 'multer';
import {WebSocketServer} from 'ws';
import CustomError from './helpers/customErrors.js';
import requestLogger from './middlewares/logging.js';
import router from './routes/index.js';

dotenv.config();
const PORT = process.env.PORT || 5000;
const DB = process.env.DB_CONNECTION_STRING;
const app = express();
const server = createServer(app); // Create HTTP server for WebSocket support

// Logging middleware
app.use(requestLogger);
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req, _res) => (req.user ? 200 : 100),
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

// Error Handling
app.use((err, _req, res, _next) => {
  if (err instanceof CustomError) {
    return res.status(err.status).json({message: err.message});
  }
  res.status(500).json({message: 'Internal Server Error'});
});

// Enable Static File Serving
app.use('/uploads', express.static('uploads'));

// Enable CORS
app.options('*', cors());

// Test Route
app.get('/', (_req, res) => {
  res.send('Hello World!');
});

// Connect to MongoDB
mongoose
  .connect(DB, {})
  .then(() => console.log('DB connection Done!'))
  .catch((err) => console.error('DB Connection Error:', err));

// ------------------- WebSocket Setup -------------------
const wss = new WebSocketServer({server});

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established.');

  // Send a welcome message to the client
  ws.send(JSON.stringify({message: 'Welcome to WebSocket Server!'}));

  // Handle messages from the client
  ws.on('message', (data) => {
    console.log('Received:', data.toString());

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
