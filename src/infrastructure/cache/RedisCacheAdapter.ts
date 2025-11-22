import Redis from 'ioredis';
import { ICacheService } from '../../domain/interfaces/ICacheService';
import { env } from '../../config/env';
import { Logger } from '../../config/logger';

export class RedisCacheAdapter implements ICacheService {
    private client: Redis;

    constructor() {
        this.client = new Redis(env.REDIS_URL);

        this.client.on('error', (err) => {
            Logger.error(`Redis Error: ${err}`);
        });

        this.client.on('connect', () => {
            Logger.info('Connected to Redis');
        });
    }

    public async get<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch (error) {
            Logger.error(`Error parsing cache data for key ${key}: ${error}`);
            return null;
        }
    }

    public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const data = JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, data);
        } else {
            await this.client.set(key, data);
        }
    }

    public async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    public getClient(): Redis {
        return this.client;
    }
}
