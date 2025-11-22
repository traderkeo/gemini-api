import express from 'express';
import { randomUUID } from 'crypto';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { config } from './config';
import errorMiddleware from './middleware/error.middleware';
import logger from './utils/logger';

const app = express();

// Trust Proxy (Required for rate limiting behind load balancers)
app.set('trust proxy', 1);

// Request ID Middleware
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] as string || randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
});

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors({ origin: config.corsOrigin, credentials: true })); // Enable CORS
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Standard Middleware
app.use(compression()); // Compress response bodies
app.use(express.json({ limit: '10kb' })); // Parse JSON bodies (limit 10kb)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health Check Route
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        pid: process.pid,
        memory: process.memoryUsage(),
    });
});

// Routes (Placeholder)
// app.use('/api/v1', routes);

// Error Handling
app.use(errorMiddleware);

export default app;
