"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelService = void 0;
class ModelService {
    constructor(gem) {
        this.gem = gem;
    }
    async getModel(name) {
        return this.gem.models.getModel(name);
    }
    async listModels(generationMethods) {
        const modelList = await this.gem.models.listModels();
        // If no filter is provided, return all models
        if (!generationMethods || generationMethods.length === 0) {
            return modelList;
        }
        // Filter models that support any of the specified generation methods
        const filteredModels = modelList.models.filter(model => {
            if (!model.supportedGenerationMethods) {
                return false;
            }
            // Check if model supports at least one of the requested methods
            return generationMethods.some(method => model.supportedGenerationMethods?.includes(method));
        });
        return {
            ...modelList,
            models: filteredModels
        };
    }
    async getGenerationMethods() {
        // Get all models
        const modelList = await this.gem.models.listModels();
        // Compile all supportedGenerationMethods from all models
        const allMethods = [];
        for (const model of modelList.models) {
            if (model.supportedGenerationMethods) {
                allMethods.push(...model.supportedGenerationMethods);
            }
        }
        // De-duplicate using Set and return as array
        return Array.from(new Set(allMethods));
    }
}
exports.ModelService = ModelService;
