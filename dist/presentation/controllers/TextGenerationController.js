"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextGenerationController = void 0;
const gemini_requests_1 = require("../../domain/types/gemini-requests");
const logger_1 = require("../../config/logger");
class TextGenerationController {
    constructor(textGenerationService) {
        this.textGenerationService = textGenerationService;
        /**
         * POST /:model/streamGenerateContent
         * Stream content generation for real-time responses using SSE.
         */
        this.streamGenerateContent = async (req, res, next) => {
            try {
                let { model } = req.params;
                if (model && model.endsWith(':streamGenerateContent')) {
                    model = model.replace(':streamGenerateContent', '');
                }
                const requestBody = await gemini_requests_1.GenerateContentRequestSchema.parseAsync(req.body);
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                // Force headers to be sent immediately
                if (res.flushHeaders)
                    res.flushHeaders();
                const stream = this.textGenerationService.streamGenerateContent(model, requestBody);
                for await (const chunk of stream) {
                    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
                    // CRITICAL FIX: 
                    // If compression middleware is running, this forces it to send the 
                    // current chunk immediately instead of buffering it.
                    if (res.flush) {
                        res.flush();
                    }
                }
                res.write('data: [DONE]\n\n');
                // Final flush ensures the DONE message is sent before ending
                if (res.flush) {
                    res.flush();
                }
                res.end();
            }
            catch (error) {
                logger_1.Logger.error(`Stream error: ${error}`);
                if (!res.headersSent) {
                    next(error);
                }
                else {
                    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
                    res.end();
                }
            }
        };
        /**
         * POST /:model/countTokens
         * Count tokens in the provided content.
         */
        this.countTokens = async (req, res, next) => {
            try {
                let { model } = req.params;
                if (model && model.endsWith(':countTokens')) {
                    model = model.replace(':countTokens', '');
                }
                const requestBody = await gemini_requests_1.CountTokensRequestSchema.parseAsync(req.body);
                const response = await this.textGenerationService.countTokens(model, requestBody);
                res.json(response);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.TextGenerationController = TextGenerationController;
