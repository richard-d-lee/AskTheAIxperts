import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

// Helmet configuration for security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Validate and sanitize input to prevent injection attacks
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspiciously long inputs
  const body = JSON.stringify(req.body);
  if (body.length > 50000) { // 50KB max
    throw new AppError('Request body too large', 413);
  }

  // Check for common injection patterns in string fields
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers like onclick=
    /\$\{.*\}/g, // Template injection
  ];

  const checkValue = (value: any, path: string = ''): void => {
    if (typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          throw new AppError(`Invalid input detected in ${path || 'request'}`, 400);
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const key of Object.keys(value)) {
        checkValue(value[key], path ? `${path}.${key}` : key);
      }
    }
  };

  if (req.body) {
    checkValue(req.body);
  }

  next();
};

// Log suspicious activity
export const logSuspiciousActivity = (req: Request, reason: string) => {
  console.warn(`[SECURITY] Suspicious activity detected:`, {
    reason,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    path: req.path,
    method: req.method,
    userId: (req as any).user?.userId,
    timestamp: new Date().toISOString(),
  });
};

// Prevent parameter pollution
export const preventParamPollution = (req: Request, res: Response, next: NextFunction) => {
  // If any query param is an array when it shouldn't be, take the last value
  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (Array.isArray(value)) {
      req.query[key] = value[value.length - 1];
    }
  }
  next();
};

// Check for blocked user agents (basic bot protection)
const blockedUserAgents = [
  /curl/i,
  /wget/i,
  /python-requests/i,
  /scrapy/i,
];

export const checkUserAgent = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'] || '';

  // Allow empty user agent for health checks
  if (req.path === '/health') {
    return next();
  }

  // Block known automation tools (can be bypassed but adds friction)
  for (const pattern of blockedUserAgents) {
    if (pattern.test(userAgent)) {
      logSuspiciousActivity(req, `Blocked user agent: ${userAgent}`);
      throw new AppError('Access denied', 403);
    }
  }

  next();
};
