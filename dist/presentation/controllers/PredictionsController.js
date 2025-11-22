"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionsController = void 0;
const gemini_requests_1 = require("../../domain/types/gemini-requests");
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
    }
}
exports.PredictionsController = PredictionsController;
