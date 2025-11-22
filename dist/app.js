"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = require("crypto");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const hpp_1 = __importDefault(require("hpp"));
const config_1 = require("./config");
const error_middleware_1 = __importDefault(require("./middleware/error.middleware"));
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
// Trust Proxy (Required for rate limiting behind load balancers)
app.set('trust proxy', 1);
// Request ID Middleware
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || (0, crypto_1.randomUUID)();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
});
// Security Middleware
app.use((0, helmet_1.default)()); // Set security HTTP headers
app.use((0, cors_1.default)({ origin: config_1.config.corsOrigin, credentials: true })); // Enable CORS
app.use((0, hpp_1.default)()); // Prevent HTTP Parameter Pollution
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);
// Standard Middleware
app.use((0, compression_1.default)()); // Compress response bodies
app.use(express_1.default.json({ limit: '10kb' })); // Parse JSON bodies (limit 10kb)
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use((0, morgan_1.default)('combined', { stream: { write: (message) => logger_1.default.info(message.trim()) } }));
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
app.use(error_middleware_1.default);
exports.default = app;
