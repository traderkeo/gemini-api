"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GemTextGeneration = void 0;
const GemBase_1 = require("../../GemBase");
const gemini_requests_1 = require("../../../../domain/types/gemini-requests");
const logger_1 = require("../../../../config/logger");
class GemTextGeneration extends GemBase_1.GemBase {
    constructor(httpClient, cache, genAI) {
        super(httpClient, cache);
        this.genAI = genAI;
    }
    /**
     * Simple streaming helper that matches the @google/genai sample usage.
     */
    async *stream(request) {
        const { model, contents, ...rest } = request;
        const modelName = model.startsWith('models/') ? model.replace('models/', '') : model;
        const normalizedContents = typeof contents === 'string'
            ? [{ parts: [{ text: contents }] }]
            : contents;
        if (rest.generationConfig?.responseSchema && !rest.generationConfig.responseMimeType) {
            logger_1.Logger.info('Smart JSON Mode: Auto-setting responseMimeType to application/json');
            rest.generationConfig.responseMimeType = 'application/json';
        }
        const response = await this.genAI.models.generateContentStream({
            model: modelName,
            contents: normalizedContents,
            ...rest,
        });
        // The SDK returns an async iterable; some versions expose `.stream`.
        const iterable = response[Symbol.asyncIterator]
            ? response
            : response.stream;
        for await (const chunk of iterable) {
            const text = this.extractText(chunk);
            if (text) {
                yield { text };
            }
        }
    }
    /**
     * Streams text generation responses for the specified model.
     */
    async *streamGenerateContent(modelName, request) {
        // Preserve the legacy signature by delegating to the new SDK-based stream.
        for await (const chunk of this.stream({ model: modelName, ...request })) {
            // Wrap plain text chunks into a minimal GenerateContentResponse shape.
            yield gemini_requests_1.GenerateContentResponseSchema.parse({
                candidates: [{
                        content: {
                            parts: [{ text: chunk.text }]
                        }
                    }]
            });
        }
    }
    /**
     * Counts tokens for a given model prompt.
     */
    async countTokens(modelName, request) {
        const cleanName = modelName.startsWith('models/') ? modelName : `models/${modelName}`;
        const endpoint = `/${cleanName}:countTokens`;
        const response = await this.post(endpoint, request);
        return gemini_requests_1.CountTokensResponseSchema.parseAsync(response);
    }
    extractText(chunk) {
        if (!chunk)
            return undefined;
        if (typeof chunk.text === 'function') {
            const text = chunk.text();
            if (text)
                return text;
        }
        if (typeof chunk.text === 'string') {
            return chunk.text;
        }
        if (Array.isArray(chunk.candidates) && chunk.candidates.length > 0) {
            const parts = chunk.candidates
                .flatMap((candidate) => candidate.content?.parts || [])
                .map((part) => part.text)
                .filter(Boolean);
            if (parts.length > 0) {
                return parts.join('');
            }
        }
        return undefined;
    }
}
exports.GemTextGeneration = GemTextGeneration;
