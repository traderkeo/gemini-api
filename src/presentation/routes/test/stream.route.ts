import { Router, Request, Response } from 'express';
import { env } from '../../../config/env';
import { Gem } from '../../../infrastructure/gemini/Gem';
import { MemoryCacheAdapter } from '../../../infrastructure/cache/MemoryCacheAdapter';

export const registerStreamRoute = (router: Router) => {
    const gem = new Gem(env.GEMINI_API_KEY, new MemoryCacheAdapter());

    const streamHandler = async (res: Response) => {
        const prompt = 'Write a short story about coding, apples, & cats.';
        const modelName = 'gemini-2.5-flash-lite';

        try {
            res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            if (res.flushHeaders) res.flushHeaders();

            const stream = gem.textGeneration.stream({
                model: modelName,
                contents: prompt,
            });

            for await (const chunk of stream) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
                if ((res as any).flush) {
                    (res as any).flush();
                }
            }

            res.write('data: [DONE]\n\n');
            if ((res as any).flush) {
                (res as any).flush();
            }

            res.end();

        } catch (err) {
            // Handle axios connection errors before headers are sent
            if (!res.headersSent) {
                handleError(res, err);
            }
        }
    };

    const handleError = (res: Response, error: any) => {
        if (!res.headersSent) {
            res.status(error.response?.status || 500).json({
                error: 'Stream test failed',
                details: error.response?.data || error.message
            });
        }
    };

    router.get('/stream/source', async (_req: Request, res: Response) => {
        try {
            await streamHandler(res);
        } catch (error: any) {
            handleError(res, error);
        }
    });

    router.get('/stream', async (_req: Request, res: Response) => {
        try {
            await streamHandler(res);
        } catch (error: any) {
            handleError(res, error);
        }
    });

    return router;
};
