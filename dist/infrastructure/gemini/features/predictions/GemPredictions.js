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
    /**
     * Streams content generation for real-time responses.
     * Returns an async generator that yields content chunks.
     * This provides better perceived performance (Time to First Token).
     */
    async *streamGenerateContent(modelName, request) {
        const cleanName = modelName.startsWith('models/') ? modelName : `models/${modelName}`;
        // Smart JSON Mode
        if (request.generationConfig?.responseSchema && !request.generationConfig?.responseMimeType) {
            logger_1.Logger.info('Smart JSON Mode: Auto-setting responseMimeType to application/json');
            request.generationConfig.responseMimeType = 'application/json';
        }
        // Get the raw Axios instance for streaming
        const axiosClient = this.httpClient.getClient();
        const endpoint = `/${cleanName}:streamGenerateContent?alt=sse`;
        try {
            const response = await axiosClient.post(endpoint, request, {
                responseType: 'stream',
                headers: {
                    'Accept': 'text/event-stream',
                },
            });
            // Parse the stream
            const stream = response.data;
            let buffer = '';
            for await (const chunk of stream) {
                const chunkStr = chunk.toString();
                buffer += chunkStr;
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer
                for (const line of lines) {
                    if (line.trim() === '')
                        continue;
                    // Google's streaming format sends lines like: data: {...}
                    if (line.startsWith('data: ')) {
                        const jsonData = line.substring(6); // Remove 'data: ' prefix
                        try {
                            const parsed = JSON.parse(jsonData);
                            const validated = await gemini_requests_1.GenerateContentResponseSchema.parseAsync(parsed);
                            yield validated;
                        }
                        catch (err) {
                            logger_1.Logger.warn(`Failed to parse streaming chunk: ${err}`);
                        }
                    }
                }
            }
            // Process any remaining data in buffer
            if (buffer.trim()) {
                if (buffer.startsWith('data: ')) {
                    const jsonData = buffer.substring(6);
                    try {
                        const parsed = JSON.parse(jsonData);
                        const validated = await gemini_requests_1.GenerateContentResponseSchema.parseAsync(parsed);
                        yield validated;
                    }
                    catch (err) {
                        logger_1.Logger.warn(`Failed to parse final streaming chunk: ${err}`);
                    }
                }
            }
        }
        catch (error) {
            logger_1.Logger.error(`Streaming error: ${error}`);
            throw error;
        }
    }
    /**
     * Counts tokens in the provided content.
     * Useful for cost control before sending expensive requests.
     */
    async countTokens(modelName, request) {
        const cleanName = modelName.startsWith('models/') ? modelName : `models/${modelName}`;
        const endpoint = `/${cleanName}:countTokens`;
        const response = await this.post(endpoint, request);
        return gemini_requests_1.CountTokensResponseSchema.parseAsync(response);
    }
}
exports.GemPredictions = GemPredictions;
