"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionService = void 0;
class PredictionService {
    constructor(gem) {
        this.gem = gem;
    }
    /**
     * Generates content using the specified model.
     */
    async generateContent(modelName, request) {
        return this.gem.predictions.generateContent(modelName, request);
    }
    /**
     * Streams content generation for real-time responses.
     * Returns an async generator that yields content chunks.
     */
    streamGenerateContent(modelName, request) {
        return this.gem.predictions.streamGenerateContent(modelName, request);
    }
    /**
     * Counts tokens in the provided content.
     * Useful for cost estimation before making expensive API calls.
     */
    async countTokens(modelName, request) {
        return this.gem.predictions.countTokens(modelName, request);
    }
}
exports.PredictionService = PredictionService;
