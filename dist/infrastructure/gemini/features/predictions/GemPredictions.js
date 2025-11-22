"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GemPredictions = void 0;
const GemBase_1 = require("../../GemBase");
const gemini_requests_1 = require("../../../../domain/types/gemini-requests");
const constants_1 = require("../../../../config/constants");
const logger_1 = require("../../../../config/logger");
class GemPredictions extends GemBase_1.GemBase {
    /**
     * Generates content using the specified model.
     * Supports text, images, and tools.
     * Includes "Smart JSON Mode" - automatically sets responseMimeType if responseSchema is present.
     */
    async generateContent(modelName, request) {
        const cleanName = modelName.startsWith('models/') ? modelName : `models/${modelName}`;
        // Smart Leveraging: Auto-set JSON MIME type if schema is present in config
        if (request.generationConfig?.responseSchema && !request.generationConfig?.responseMimeType) {
            logger_1.Logger.info('Smart JSON Mode: Auto-setting responseMimeType to application/json');
            request.generationConfig.responseMimeType = 'application/json';
        }
        // Determine Rate Limiter based on model
        let limiterKey = 'gem:limiter:default';
        let limiterOptions = { minTime: 1000 }; // Default 60 RPM
        if (cleanName.includes('flash')) {
            limiterKey = 'gem:limiter:flash';
            limiterOptions = {
                minTime: 60000 / constants_1.RATE_LIMITS.FLASH.RPM,
                reservoir: constants_1.RATE_LIMITS.FLASH.RPM,
                reservoirRefreshAmount: constants_1.RATE_LIMITS.FLASH.RPM,
                reservoirRefreshInterval: 60 * 1000
            };
        }
        else if (cleanName.includes('pro')) {
            limiterKey = 'gem:limiter:pro';
            limiterOptions = {
                minTime: 60000 / constants_1.RATE_LIMITS.PRO.RPM,
                reservoir: constants_1.RATE_LIMITS.PRO.RPM,
                reservoirRefreshAmount: constants_1.RATE_LIMITS.PRO.RPM,
                reservoirRefreshInterval: 60 * 1000
            };
        }
        const limiter = this.getLimiter(limiterKey, limiterOptions);
        // Schedule the request
        return limiter.schedule(async () => {
            const response = await this.post(`/${cleanName}:generateContent`, request);
            return gemini_requests_1.GenerateContentResponseSchema.parseAsync(response);
        });
    }
}
exports.GemPredictions = GemPredictions;
