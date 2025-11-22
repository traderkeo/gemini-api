import app from './app';
import { env } from './config/env';
import { Logger } from './config/logger';
import cluster from 'cluster';
import os from 'os';

const numCPUs = os.cpus().length;

if (cluster.isPrimary && env.NODE_ENV === 'production') {
    Logger.info(`Primary ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, _code, _signal) => {
        Logger.warn(`worker ${worker.process.pid} died`);
        // Replace the dead worker
        cluster.fork();
    });
} else {
    const port = env.PORT;
    app.listen(port, () => {
        Logger.info(`Server running on port ${port} - Environment: ${env.NODE_ENV} - Worker: ${process.pid}`);
    });
}
