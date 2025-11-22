import { Router, Request, Response, NextFunction } from 'express';
import { TextGenerationController } from '../../controllers/TextGenerationController';

export const createTextGenerationRouter = (controller: TextGenerationController): Router => {
    const router = Router();

    const promptMiddleware = (req: Request, _res: Response, next: NextFunction) => {
        const prompt = req.query.prompt as string | undefined;

        // If a prompt is provided and no contents exist, build a minimal request body for testing.
        if (prompt && (!req.body || !req.body.contents)) {
            req.body = {
                contents: [{ parts: [{ text: prompt }] }]
            };
        }

        next();
    };

    // POST /v1/textGeneration/streamGenerateContent/:model
    router.post('/streamGenerateContent/:model', promptMiddleware, controller.streamGenerateContent);

    // POST /v1/textGeneration/countTokens/:model
    router.post('/countTokens/:model', promptMiddleware, controller.countTokens);

    return router;
};
