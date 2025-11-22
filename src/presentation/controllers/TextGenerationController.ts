import { Request, Response, NextFunction } from 'express';
import { TextGenerationService } from '../../application/services/TextGenerationService';
import {
    GenerateContentRequestSchema,
    CountTokensRequestSchema
} from '../../domain/types/gemini-requests';
import { Logger } from '../../config/logger';

export class TextGenerationController {
    constructor(private textGenerationService: TextGenerationService) { }

    /**
     * POST /:model/streamGenerateContent
     * Stream content generation for real-time responses using SSE.
     */
    public streamGenerateContent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { model } = req.params;

            if (model && model.endsWith(':streamGenerateContent')) {
                model = model.replace(':streamGenerateContent', '');
            }

            const requestBody = await GenerateContentRequestSchema.parseAsync(req.body);

            res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Force headers to be sent immediately
            if (res.flushHeaders) res.flushHeaders();

            const stream = this.textGenerationService.streamGenerateContent(model, requestBody);

            for await (const chunk of stream) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);

                // CRITICAL FIX: 
                // If compression middleware is running, this forces it to send the 
                // current chunk immediately instead of buffering it.
                if ((res as any).flush) {
                    (res as any).flush();
                }
            }

            res.write('data: [DONE]\n\n');

            // Final flush ensures the DONE message is sent before ending
            if ((res as any).flush) {
                (res as any).flush();
            }

            res.end();
        } catch (error) {
            Logger.error(`Stream error: ${error}`);
            if (!res.headersSent) {
                next(error);
            } else {
                res.write(`event: error\ndata: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
                res.end();
            }
        }
    };

    /**
     * POST /:model/countTokens
     * Count tokens in the provided content.
     */
    public countTokens = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { model } = req.params;

            if (model && model.endsWith(':countTokens')) {
                model = model.replace(':countTokens', '');
            }

            const requestBody = await CountTokensRequestSchema.parseAsync(req.body);

            const response = await this.textGenerationService.countTokens(model, requestBody);
            res.json(response);
        } catch (error) {
            next(error);
        }
    };
}
