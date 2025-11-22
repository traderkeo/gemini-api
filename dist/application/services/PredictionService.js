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
}
exports.PredictionService = PredictionService;
