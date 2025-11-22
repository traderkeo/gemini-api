"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCacheAdapter = void 0;
class MemoryCacheAdapter {
    constructor() {
        this.cache = new Map();
    }
    async get(key) {
        const item = this.cache.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, ttlSeconds) {
        const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : Infinity;
        this.cache.set(key, { value, expiry });
    }
    async del(key) {
        this.cache.delete(key);
    }
}
exports.MemoryCacheAdapter = MemoryCacheAdapter;
