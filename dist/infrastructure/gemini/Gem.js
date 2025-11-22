"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gem = void 0;
const AxiosHttpClient_1 = require("../http/AxiosHttpClient");
const GemModels_1 = require("./features/models/GemModels");
const GemPredictions_1 = require("./features/predictions/GemPredictions");
const GemTextGeneration_1 = require("./features/textGeneration/GemTextGeneration");
const constants_1 = require("../../config/constants");
const genai_1 = require("@google/genai");
class Gem {
    constructor(apiKey, cacheService) {
        const httpClient = new AxiosHttpClient_1.AxiosHttpClient(constants_1.GEMINI_BASE_URL, apiKey);
        const genAI = new genai_1.GoogleGenAI({ apiKey });
        // Initialize features
        this.models = new GemModels_1.GemModels(httpClient, cacheService);
        this.predictions = new GemPredictions_1.GemPredictions(httpClient, cacheService);
        this.textGeneration = new GemTextGeneration_1.GemTextGeneration(httpClient, cacheService, genAI);
    }
}
exports.Gem = Gem;
