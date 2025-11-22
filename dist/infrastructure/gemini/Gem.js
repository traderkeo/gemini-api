"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gem = void 0;
const AxiosHttpClient_1 = require("../http/AxiosHttpClient");
const GemModels_1 = require("./features/models/GemModels");
const GemPredictions_1 = require("./features/predictions/GemPredictions");
const constants_1 = require("../../config/constants");
class Gem {
    constructor(apiKey, cacheService) {
        const httpClient = new AxiosHttpClient_1.AxiosHttpClient(constants_1.GEMINI_BASE_URL, apiKey);
        // Initialize features
        this.models = new GemModels_1.GemModels(httpClient, cacheService);
        this.predictions = new GemPredictions_1.GemPredictions(httpClient, cacheService);
    }
}
exports.Gem = Gem;
