"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const ErrorHandler_1 = require("./presentation/middlewares/ErrorHandler");
const RateLimiter_1 = require("./presentation/middlewares/RateLimiter");
const MemoryCacheAdapter_1 = require("./infrastructure/cache/MemoryCacheAdapter");
// import { RedisCacheAdapter } from './infrastructure/cache/RedisCacheAdapter';
const Gem_1 = require("./infrastructure/gemini/Gem");
const ModelService_1 = require("./application/services/ModelService");
const PredictionService_1 = require("./application/services/PredictionService");
const TextGenerationService_1 = require("./application/services/TextGenerationService");
const ModelsController_1 = require("./presentation/controllers/ModelsController");
const PredictionsController_1 = require("./presentation/controllers/PredictionsController");
const TextGenerationController_1 = require("./presentation/controllers/TextGenerationController");
const models_routes_1 = require("./presentation/routes/v1/models.routes");
const predictions_routes_1 = require("./presentation/routes/v1/predictions.routes");
const textGeneration_routes_1 = require("./presentation/routes/v1/textGeneration.routes");
const test_routes_1 = require("./presentation/routes/test/test.routes");
const client = __importStar(require("prom-client"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        // Dependency Injection Root
        // Switch to MemoryCacheAdapter for local dev without Redis
        const cacheService = new MemoryCacheAdapter_1.MemoryCacheAdapter();
        // const cacheService = new RedisCacheAdapter(); // Uncomment for Production/Redis
        this.gem = new Gem_1.Gem(env_1.env.GEMINI_API_KEY, cacheService);
        const modelService = new ModelService_1.ModelService(this.gem);
        const predictionService = new PredictionService_1.PredictionService(this.gem);
        const textGenerationService = new TextGenerationService_1.TextGenerationService(this.gem);
        const modelsController = new ModelsController_1.ModelsController(modelService);
        const predictionsController = new PredictionsController_1.PredictionsController(predictionService);
        const textGenerationController = new TextGenerationController_1.TextGenerationController(textGenerationService);
        this.routes(modelsController, predictionsController, textGenerationController);
        this.metrics();
    }
    config() {
        this.app.use((0, cors_1.default)());
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: false,
        }));
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' })); // Support large payloads
        this.app.use((0, morgan_1.default)('combined', { stream: { write: (message) => logger_1.Logger.http(message.trim()) } }));
        this.app.use(RateLimiter_1.apiLimiter);
    }
    routes(modelsController, predictionsController, textGenerationController) {
        this.app.use('/v1/models', (0, models_routes_1.createModelsRouter)(modelsController));
        this.app.use('/v1', (0, predictions_routes_1.createPredictionsRouter)(predictionsController));
        this.app.use('/v1/textGeneration', (0, textGeneration_routes_1.createTextGenerationRouter)(textGenerationController));
        // Test routes for browser-based testing
        this.app.use('/test', (0, test_routes_1.createTestRouter)());
        // Health Check
        this.app.get('/health', (_req, res) => { res.status(200).send('OK'); });
        // Error Handler must be last
        this.app.use(ErrorHandler_1.ErrorHandler);
    }
    metrics() {
        const collectDefaultMetrics = client.collectDefaultMetrics;
        collectDefaultMetrics();
        this.app.get('/metrics', async (_req, res) => {
            res.set('Content-Type', client.register.contentType);
            res.end(await client.register.metrics());
        });
    }
}
exports.App = App;
exports.default = new App().app;
