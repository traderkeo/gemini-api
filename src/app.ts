import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { Logger } from './config/logger';
import { ErrorHandler } from './presentation/middlewares/ErrorHandler';
import { apiLimiter } from './presentation/middlewares/RateLimiter';
import { MemoryCacheAdapter } from './infrastructure/cache/MemoryCacheAdapter';
// import { RedisCacheAdapter } from './infrastructure/cache/RedisCacheAdapter';
import { Gem } from './infrastructure/gemini/Gem';
import { ModelService } from './application/services/ModelService';
import { PredictionService } from './application/services/PredictionService';
import { TextGenerationService } from './application/services/TextGenerationService';
import { ModelsController } from './presentation/controllers/ModelsController';
import { PredictionsController } from './presentation/controllers/PredictionsController';
import { TextGenerationController } from './presentation/controllers/TextGenerationController';
import { createModelsRouter } from './presentation/routes/v1/models.routes';
import { createPredictionsRouter } from './presentation/routes/v1/predictions.routes';
import { createTextGenerationRouter } from './presentation/routes/v1/textGeneration.routes';
import { createTestRouter } from './presentation/routes/test/test.routes';
import * as client from 'prom-client';

export class App {
    public app: Application;
    private gem: Gem;

    constructor() {
        this.app = express();
        this.config();

        // Dependency Injection Root
        // Switch to MemoryCacheAdapter for local dev without Redis
        const cacheService = new MemoryCacheAdapter();
        // const cacheService = new RedisCacheAdapter(); // Uncomment for Production/Redis

        this.gem = new Gem(env.GEMINI_API_KEY, cacheService);

        const modelService = new ModelService(this.gem);
        const predictionService = new PredictionService(this.gem);
        const textGenerationService = new TextGenerationService(this.gem);

        const modelsController = new ModelsController(modelService);
        const predictionsController = new PredictionsController(predictionService);
        const textGenerationController = new TextGenerationController(textGenerationService);

        this.routes(modelsController, predictionsController, textGenerationController);
        this.metrics();
    }

    private config(): void {
        this.app.use(cors());
        this.app.use(helmet({
            contentSecurityPolicy: false,
        }));
        this.app.use(compression());
        this.app.use(express.json({ limit: '10mb' })); // Support large payloads
        this.app.use(morgan('combined', { stream: { write: (message) => Logger.http(message.trim()) } }));
        this.app.use(apiLimiter);
    }

    private routes(modelsController: ModelsController, predictionsController: PredictionsController, textGenerationController: TextGenerationController): void {
        this.app.use('/v1/models', createModelsRouter(modelsController));
        this.app.use('/v1', createPredictionsRouter(predictionsController));
        this.app.use('/v1/textGeneration', createTextGenerationRouter(textGenerationController));

        // Test routes for browser-based testing
        this.app.use('/test', createTestRouter());

        // Health Check
        this.app.get('/health', (_req, res) => { res.status(200).send('OK'); });

        // Error Handler must be last
        this.app.use(ErrorHandler);
    }

    private metrics(): void {
        const collectDefaultMetrics = client.collectDefaultMetrics;
        collectDefaultMetrics();

        this.app.get('/metrics', async (_req, res) => {
            res.set('Content-Type', client.register.contentType);
            res.end(await client.register.metrics());
        });
    }
}

export default new App().app;
