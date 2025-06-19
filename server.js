import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import carRoutes from './routes/car.routes.js';
import packageRoutes from './routes/package.routes.js';
import servicePackageRoutes from './routes/servicePackage.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import authRoutes from './routes/auth.routes.js';
import activityRoutes from "./routes/activity.routes.js";


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Your frontend
    credentials: true,
  },
});

// Make io accessible globally for controllers
global.io = io;

// Handle socket connection
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  
  // Join room using sessionId
  socket.on('register-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session room ${sessionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/car', carRoutes);
app.use('/api/package', packageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/service-package', servicePackageRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/api/activities", activityRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
);
