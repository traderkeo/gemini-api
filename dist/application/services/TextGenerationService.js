"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextGenerationService = void 0;
class TextGenerationService {
    constructor(gem) {
        this.gem = gem;
    }
    /**
     * Streams text generation responses for the specified model.
     */
    streamGenerateContent(modelName, request) {
        return this.gem.textGeneration.streamGenerateContent(modelName, request);
    }
    /**
     * Convenience wrapper that matches the new SDK-style stream signature.
     */
    stream(request) {
        return this.gem.textGeneration.stream(request);
    }
    /**
     * Counts tokens for a given prompt.
     */
    async countTokens(modelName, request) {
        return this.gem.textGeneration.countTokens(modelName, request);
    }
}
exports.TextGenerationService = TextGenerationService;
