"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionsController = void 0;
const gemini_requests_1 = require("../../domain/types/gemini-requests");
const logger_1 = require("../../config/logger");
class PredictionsController {
    constructor(predictionService) {
        this.predictionService = predictionService;
        /**
         * POST /:model/generateContent
         * Generate content using the specified model.
         */
        this.generateContent = async (req, res, next) => {
            try {
                let { model } = req.params;
                if (model && model.endsWith(':generateContent')) {
                    model = model.replace(':generateContent', '');
                }
                // Validate request body
                const requestBody = await gemini_requests_1.GenerateContentRequestSchema.parseAsync(req.body);
                const response = await this.predictionService.generateContent(model, requestBody);
                res.json(response);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /:model/streamGenerateContent
         * Stream content generation for real-time responses.
         * Uses Server-Sent Events (SSE) to stream chunks.
         */
        this.streamGenerateContent = async (req, res, next) => {
            try {
                let { model } = req.params;
                if (model && model.endsWith(':streamGenerateContent')) {
                    model = model.replace(':streamGenerateContent', '');
                }
                // Validate request body
                const requestBody = await gemini_requests_1.GenerateContentRequestSchema.parseAsync(req.body);
                // Set SSE headers
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                res.flushHeaders();
                // Stream chunks to client
                const stream = this.predictionService.streamGenerateContent(model, requestBody);
                for await (const chunk of stream) {
                    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
                }
                res.write('data: [DONE]\n\n');
                res.end();
            }
            catch (error) {
                logger_1.Logger.error(`Stream error: ${error}`);
                // For SSE, we can't call next() after headers are sent
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
                // Validate request body
                const requestBody = await gemini_requests_1.CountTokensRequestSchema.parseAsync(req.body);
                const response = await this.predictionService.countTokens(model, requestBody);
                res.json(response);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.PredictionsController = PredictionsController;
