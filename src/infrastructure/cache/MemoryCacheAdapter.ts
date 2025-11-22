import { ICacheService } from '../../domain/interfaces/ICacheService';

export class MemoryCacheAdapter implements ICacheService {
    private cache: Map<string, { value: any; expiry: number }>;

    constructor() {
        this.cache = new Map();
    }

    public async get<T>(key: string): Promise<T | null> {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value as T;
    }

    public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : Infinity;
        this.cache.set(key, { value, expiry });
    }

    public async del(key: string): Promise<void> {
        this.cache.delete(key);
    }
}
