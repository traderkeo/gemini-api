import { Request, Response, NextFunction } from 'express';
import { PredictionService } from '../../application/services/PredictionService';
import { GenerateContentRequestSchema } from '../../domain/types/gemini-requests';

export class PredictionsController {
    constructor(private predictionService: PredictionService) { }

    /**
     * POST /:model/generateContent
     * Generate content using the specified model.
     */
    public generateContent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { model } = req.params;

            if (model && model.endsWith(':generateContent')) {
                model = model.replace(':generateContent', '');
            }

            // Validate request body
            const requestBody = await GenerateContentRequestSchema.parseAsync(req.body);

            const response = await this.predictionService.generateContent(model, requestBody);
            res.json(response);
        } catch (error) {
            next(error);
        }
    };

}
