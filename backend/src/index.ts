import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalLimiter, authLimiter } from './middleware/rateLimit.js';
import {
  securityHeaders,
  sanitizeInput,
  preventParamPollution,
  checkUserAgent,
} from './middleware/security.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import historyRoutes from './routes/history.js';

const app = express();

// Trust proxy for rate limiting behind reverse proxy (Render)
app.set('trust proxy', 1);

// Security headers
app.use(securityHeaders);

// CORS
app.use(cors({
  origin: config.server.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Global rate limiting
app.use(globalLimiter);

// Security middleware
app.use(preventParamPollution);
app.use(sanitizeInput);
app.use(checkUserAgent);

// Health check (before auth routes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes with specific rate limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port} in ${config.server.nodeEnv} mode`);
  console.log('Security features enabled: rate limiting, helmet, input sanitization');
});

export default app;
