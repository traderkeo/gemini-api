import { Router } from 'express';
import { TextGenerationController } from '../../controllers/TextGenerationController';

export const createTextGenerationRouter = (controller: TextGenerationController): Router => {
    const router = Router();

    // POST /v1/textGeneration/streamGenerateContent/:model
    router.post('/streamGenerateContent/:model', controller.streamGenerateContent);

    // POST /v1/textGeneration/countTokens/:model
    router.post('/countTokens/:model', controller.countTokens);

    return router;
};
