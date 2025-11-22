"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelsController = void 0;
class ModelsController {
    constructor(modelService) {
        this.modelService = modelService;
        this.getModel = async (req, res, next) => {
            try {
                const { name } = req.params;
                const model = await this.modelService.getModel(name);
                res.json(model);
            }
            catch (error) {
                next(error);
            }
        };
        this.listModels = async (req, res, next) => {
            try {
                // Get the 'methods' query parameter and parse comma-separated values
                const methodsParam = req.query.methods;
                const generationMethods = methodsParam
                    ? methodsParam.split(',').map(m => m.trim()).filter(m => m.length > 0)
                    : undefined;
                const models = await this.modelService.listModels(generationMethods);
                res.json(models);
            }
            catch (error) {
                next(error);
            }
        };
        this.getGenerationMethods = async (_req, res, next) => {
            try {
                const generationMethods = await this.modelService.getGenerationMethods();
                res.json(generationMethods);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ModelsController = ModelsController;
