import { Router } from 'express';
import { PredictionsController } from '../../controllers/PredictionsController';

export const createPredictionsRouter = (controller: PredictionsController): Router => {
    const router = Router();

    // POST /v1/generateContent/:model - Generate content
    router.post('/generateContent/:model', controller.generateContent);

    return router;
};
