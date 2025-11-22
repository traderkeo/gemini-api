import { Router, Request, Response } from 'express';
import axios from 'axios';
import { env } from '../../../config/env';

export const registerStreamRoute = (router: Router) => {
    const baseURL = `http://localhost:${env.PORT}`;

    const streamHandler = async (res: Response) => {
        const prompt = 'Write a short story about coding, apples, & cats.';
        const modelName = 'gemini-2.5-flash-lite';

        try {
            const response = await axios.post(
                `${baseURL}/v1/textGeneration/streamGenerateContent/${modelName}`,
                {
                    contents: [{ parts: [{ text: prompt }] }]
                },
                {
                    responseType: 'stream',
                    decompress: false // 1. Prevent Axios buffering for decompression
                }
            );

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // 2. Force headers to send immediately (bypassing some middleware)
            if (res.flushHeaders) res.flushHeaders();

            // 3. Pipe the data
            response.data.pipe(res);

            // Optional: Handle stream close to prevent memory leaks
            response.data.on('end', () => res.end());
            res.on('close', () => {
                // Destroy upstream stream if client disconnects
                response.data.destroy();
            });

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
