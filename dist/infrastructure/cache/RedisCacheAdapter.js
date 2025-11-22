"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheAdapter = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
class RedisCacheAdapter {
    constructor() {
        this.client = new ioredis_1.default(env_1.env.REDIS_URL);
        this.client.on('error', (err) => {
            logger_1.Logger.error(`Redis Error: ${err}`);
        });
        this.client.on('connect', () => {
            logger_1.Logger.info('Connected to Redis');
        });
    }
    async get(key) {
        const data = await this.client.get(key);
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch (error) {
            logger_1.Logger.error(`Error parsing cache data for key ${key}: ${error}`);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        const data = JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, data);
        }
        else {
            await this.client.set(key, data);
        }
    }
    async del(key) {
        await this.client.del(key);
    }
    getClient() {
        return this.client;
    }
}
exports.RedisCacheAdapter = RedisCacheAdapter;
