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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GemModels = void 0;
const GemBase_1 = require("../../GemBase");
const gemini_models_1 = require("../../../../domain/types/gemini-models");
const constants_1 = require("../../../../config/constants");
class GemModels extends GemBase_1.GemBase {
    async getModel(name) {
        const cleanName = name.startsWith('models/') ? name : `models/${name}`;
        const cacheKey = `gem:model:${cleanName}`;
        // 1. Check Cache
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        // 2. API Call
        const response = await this.get(`/${cleanName}`);
        // 3. Validation
        const parsed = await gemini_models_1.GeminiModelSchema.parseAsync(response);
        // 4. Update Cache
        await this.cache.set(cacheKey, parsed, constants_1.CACHE_TTL.MODELS);
        return parsed;
    }
    async listModels(pageSize = 1000) {
        const cacheKey = `gem:models:list:${pageSize}`;
        // 1. Check Cache
        const cached = await this.cache.get(cacheKey);
        if (cached) {
            const { Logger } = await Promise.resolve().then(() => __importStar(require('../../../../config/logger')));
            Logger.info('Returning cached model list');
            return cached;
        }
        // 2. API Call
        // For simplicity, we are just fetching the first page as requested "up to 1000"
        // In a full implementation, we would handle pagination tokens recursively if needed.
        const response = await this.get(`/models?pageSize=${pageSize}`);
        // 3. Debug Log
        const { Logger } = await Promise.resolve().then(() => __importStar(require('../../../../config/logger')));
        Logger.info(`Google API Response: ${JSON.stringify(response)}`);
        // 4. Validation
        const parsed = await gemini_models_1.GeminiModelListSchema.parseAsync(response);
        // 5. Update Cache
        await this.cache.set(cacheKey, parsed, constants_1.CACHE_TTL.MODELS);
        return parsed;
    }
}
exports.GemModels = GemModels;
