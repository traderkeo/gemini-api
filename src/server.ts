import app from './app';
import { config } from './config';
import logger from './utils/logger';

const port = config.port;

const server = app.listen(port, () => {
    logger.info(`=================================`);
    logger.info(`======= ENV: ${config.env} =======`);
    logger.info(`🚀 App listening on the port ${port}`);
    logger.info(`=================================`);
});

// Performance: Keep-Alive Timeouts (Prevent 502s with Load Balancers)
// Ensure Node's keep-alive is slightly longer than the LB's (e.g., AWS ALB is 60s)
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds

// Graceful Shutdown
const shutdown = () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    process.exit(1);
});
