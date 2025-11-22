import { Router } from 'express';
import { ModelsController } from '../../controllers/ModelsController';

export const createModelsRouter = (controller: ModelsController): Router => {
    const router = Router();

    router.get('/', controller.listModels);
    router.get('/generation-methods', controller.getGenerationMethods);
    router.get('/:name', controller.getModel);

    return router;
};
