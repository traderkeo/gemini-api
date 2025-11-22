"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const logger_1 = __importDefault(require("./utils/logger"));
const port = config_1.config.port;
const server = app_1.default.listen(port, () => {
    logger_1.default.info(`=================================`);
    logger_1.default.info(`======= ENV: ${config_1.config.env} =======`);
    logger_1.default.info(`🚀 App listening on the port ${port}`);
    logger_1.default.info(`=================================`);
});
// Performance: Keep-Alive Timeouts (Prevent 502s with Load Balancers)
// Ensure Node's keep-alive is slightly longer than the LB's (e.g., AWS ALB is 60s)
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds
// Graceful Shutdown
const shutdown = () => {
    logger_1.default.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger_1.default.info('HTTP server closed');
        process.exit(0);
    });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.default.error('UNHANDLED REJECTION! 💥 Shutting down...');
    logger_1.default.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.default.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger_1.default.error(err.name, err.message);
    process.exit(1);
});
