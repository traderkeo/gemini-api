import Bottleneck from 'bottleneck';
import { AxiosHttpClient } from '../http/AxiosHttpClient';
import { ICacheService } from '../../domain/interfaces/ICacheService';
import { GeminiErrorMapper } from './utils/GeminiErrorMapper';
import { Logger } from '../../config/logger';
import { RedisCacheAdapter } from '../cache/RedisCacheAdapter';

export abstract class GemBase {
    protected httpClient: AxiosHttpClient;
    protected cache: ICacheService;
    protected limiters: Map<string, Bottleneck>;

    constructor(httpClient: AxiosHttpClient, cache: ICacheService) {
        this.httpClient = httpClient;
        this.cache = cache;
        this.limiters = new Map();
    }

    protected async get<T>(url: string): Promise<T> {
        try {
            return await this.httpClient.get<T>(url);
        } catch (error) {
            throw GeminiErrorMapper.map(error);
        }
    }

    protected async post<T>(url: string, data: any): Promise<T> {
        try {
            return await this.httpClient.post<T>(url, data);
        } catch (error) {
            throw GeminiErrorMapper.map(error);
        }
    }

    // Rate Limiter Logic
    protected getLimiter(key: string, options: Bottleneck.ConstructorOptions): Bottleneck {
        if (!this.limiters.has(key)) {
            // If we are using Redis for distributed rate limiting
            if (this.cache instanceof RedisCacheAdapter) {
                // In a real implementation, we would pass Redis connection info here.
                // For now, we simulate the distributed setup structure.
                const limiter = new Bottleneck({
                    ...options,
                    id: key,
                    // datastore: 'redis', // Uncomment to enable real Redis distributed limiting
                    // clientOptions: { host: 'localhost', port: 6379 }
                });

                limiter.on('error', (err) => {
                    Logger.error(`Limiter ${key} error: ${err}`);
                });

                // Configure Retry Strategy
                limiter.on('failed', async (error: any, jobInfo: any) => {
                    const status = error?.response?.status;
                    if (status === 429 || status >= 500) {
                        Logger.warn(`Job ${jobInfo.options.id} failed with status ${status}. Retrying...`);
                        // Exponential Backoff: 2^n * 1000 + jitter
                        const waitTime = Math.pow(2, jobInfo.retryCount) * 1000 + Math.random() * 100;
                        return waitTime;
                    }
                    return null; // Do not retry other errors
                });

                this.limiters.set(key, limiter);
            } else {
                // Fallback to local
                const limiter = new Bottleneck(options);

                // Configure Retry Strategy
                limiter.on('failed', async (error: any, jobInfo: any) => {
                    const status = error?.response?.status;
                    if (status === 429 || status >= 500) {
                        Logger.warn(`Job ${jobInfo.options.id} failed with status ${status}. Retrying...`);
                        const waitTime = Math.pow(2, jobInfo.retryCount) * 1000 + Math.random() * 100;
                        return waitTime;
                    }
                    return null;
                });

                this.limiters.set(key, limiter);
            }
        }
        return this.limiters.get(key)!;
    }
}
