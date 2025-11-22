import { Request, Response, NextFunction } from 'express';
import { ModelService } from '../../application/services/ModelService';

export class ModelsController {
    constructor(private modelService: ModelService) { }

    public getModel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name } = req.params;
            const model = await this.modelService.getModel(name);
            res.json(model);
        } catch (error) {
            next(error);
        }
    };

    public listModels = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get the 'methods' query parameter and parse comma-separated values
            const methodsParam = req.query.methods as string | undefined;
            const generationMethods = methodsParam
                ? methodsParam.split(',').map(m => m.trim()).filter(m => m.length > 0)
                : undefined;

            const models = await this.modelService.listModels(generationMethods);
            res.json(models);
        } catch (error) {
            next(error);
        }
    };

    public getGenerationMethods = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const generationMethods = await this.modelService.getGenerationMethods();
            res.json(generationMethods);
        } catch (error) {
            next(error);
        }
    };
}
