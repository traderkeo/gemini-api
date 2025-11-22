"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GemBase = void 0;
const bottleneck_1 = __importDefault(require("bottleneck"));
const GeminiErrorMapper_1 = require("./utils/GeminiErrorMapper");
const logger_1 = require("../../config/logger");
const RedisCacheAdapter_1 = require("../cache/RedisCacheAdapter");
class GemBase {
    constructor(httpClient, cache) {
        this.httpClient = httpClient;
        this.cache = cache;
        this.limiters = new Map();
    }
    async get(url) {
        try {
            return await this.httpClient.get(url);
        }
        catch (error) {
            throw GeminiErrorMapper_1.GeminiErrorMapper.map(error);
        }
    }
    async post(url, data) {
        try {
            return await this.httpClient.post(url, data);
        }
        catch (error) {
            throw GeminiErrorMapper_1.GeminiErrorMapper.map(error);
        }
    }
    // Rate Limiter Logic
    getLimiter(key, options) {
        if (!this.limiters.has(key)) {
            // If we are using Redis for distributed rate limiting
            if (this.cache instanceof RedisCacheAdapter_1.RedisCacheAdapter) {
                // In a real implementation, we would pass Redis connection info here.
                // For now, we simulate the distributed setup structure.
                const limiter = new bottleneck_1.default({
                    ...options,
                    id: key,
                    // datastore: 'redis', // Uncomment to enable real Redis distributed limiting
                    // clientOptions: { host: 'localhost', port: 6379 }
                });
                limiter.on('error', (err) => {
                    logger_1.Logger.error(`Limiter ${key} error: ${err}`);
                });
                // Configure Retry Strategy
                limiter.on('failed', async (error, jobInfo) => {
                    const status = error?.response?.status;
                    if (status === 429 || status >= 500) {
                        logger_1.Logger.warn(`Job ${jobInfo.options.id} failed with status ${status}. Retrying...`);
                        // Exponential Backoff: 2^n * 1000 + jitter
                        const waitTime = Math.pow(2, jobInfo.retryCount) * 1000 + Math.random() * 100;
                        return waitTime;
                    }
                    return null; // Do not retry other errors
                });
                this.limiters.set(key, limiter);
            }
            else {
                // Fallback to local
                const limiter = new bottleneck_1.default(options);
                // Configure Retry Strategy
                limiter.on('failed', async (error, jobInfo) => {
                    const status = error?.response?.status;
                    if (status === 429 || status >= 500) {
                        logger_1.Logger.warn(`Job ${jobInfo.options.id} failed with status ${status}. Retrying...`);
                        const waitTime = Math.pow(2, jobInfo.retryCount) * 1000 + Math.random() * 100;
                        return waitTime;
                    }
                    return null;
                });
                this.limiters.set(key, limiter);
            }
        }
        return this.limiters.get(key);
    }
}
exports.GemBase = GemBase;
