import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import historyRoutes from './routes/history.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.server.frontendUrl,
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port} in ${config.server.nodeEnv} mode`);
});

export default app;
