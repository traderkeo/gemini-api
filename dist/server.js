"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const numCPUs = os_1.default.cpus().length;
if (cluster_1.default.isPrimary && env_1.env.NODE_ENV === 'production') {
    logger_1.Logger.info(`Primary ${process.pid} is running`);
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', (worker, _code, _signal) => {
        logger_1.Logger.warn(`worker ${worker.process.pid} died`);
        // Replace the dead worker
        cluster_1.default.fork();
    });
}
else {
    const port = env_1.env.PORT;
    app_1.default.listen(port, () => {
        logger_1.Logger.info(`Server running on port ${port} - Environment: ${env_1.env.NODE_ENV} - Worker: ${process.pid}`);
    });
}
