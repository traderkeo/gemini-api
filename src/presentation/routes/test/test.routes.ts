import { Router, Request, Response } from 'express';
import axios from 'axios';
import { env } from '../../../config/env';
import { registerPredictRoute } from './predict.route';
import { registerStreamRoute } from './stream.route';

export const createTestRouter = (): Router => {
    const router = Router();

    // Register separate test routes
    registerPredictRoute(router);
    registerStreamRoute(router);

    const baseURL = `http://localhost:${env.PORT}`;

    // Test 1: Get a random model filtered by supportedGenerationMethods type
    router.get('/model', async (req: Request, res: Response) => {
        try {
            const type = req.query.type as string || 'generateContent';

            // Get all models
            const response = await axios.get(`${baseURL}/v1/models`);
            const allModels = response.data.models || [];

            // Filter by supportedGenerationMethods
            const filteredModels = allModels.filter((model: any) => {
                const methods = model.supportedGenerationMethods || [];
                return methods.includes(type);
            });

            if (filteredModels.length === 0) {
                return res.status(404).json({
                    error: `No models found with supportedGenerationMethods: ${type}`,
                    availableTypes: Array.from(new Set(
                        allModels.flatMap((m: any) => m.supportedGenerationMethods || [])
                    ))
                });
            }

            // Select random model
            const randomModel = filteredModels[Math.floor(Math.random() * filteredModels.length)];
            const modelName = randomModel.name.replace('models/', '');

            // Get specific model details
            const modelResponse = await axios.get(`${baseURL}/v1/models/${modelName}`);

            return res.json({
                test: 'GET /test/model with type filter',
                requestedType: type,
                selectedModel: modelName,
                displayName: randomModel.displayName,
                totalMatchingModels: filteredModels.length,
                data: modelResponse.data
            });
        } catch (error: any) {
            return res.status(error.response?.status || 500).json({
                test: 'GET /test/model',
                error: error.message,
                details: error.response?.data
            });
        }
    });

    // Test 2: Test prediction with random numerical dataset and random predict model
    router.get('/prediction', async (_req: Request, res: Response) => {
        try {
            // Get all models that support 'generateContent' (excluding image models)
            const response = await axios.get(`${baseURL}/v1/models`);
            const allModels = response.data.models || [];

            // Filter models that support generateContent (text-based models, not image models)
            const textModels = allModels.filter((model: any) => {
                const methods = model.supportedGenerationMethods || [];
                const name = model.name.toLowerCase();
                // Include generateContent models but exclude vision/image models
                return methods.includes('generateContent') &&
                    !name.includes('vision') &&
                    !name.includes('imagen');
            });

            if (textModels.length === 0) {
                return res.status(404).json({
                    error: 'No suitable text generation models found'
                });
            }

            // Select random model
            const randomModel = textModels[Math.floor(Math.random() * textModels.length)];
            const modelName = randomModel.name.replace('models/', '');

            // Generate random numerical dataset for prediction request
            const datasetSize = Math.floor(Math.random() * 10) + 5; // 5-14 data points
            const dataset = Array.from({ length: datasetSize }, (_, i) => ({
                x: i + 1,
                y: Math.floor(Math.random() * 100) + 1
            }));

            const prompt = `Given the following dataset:
${dataset.map(d => `x: ${d.x}, y: ${d.y}`).join('\n')}

Analyze this data and predict:
1. The trend or pattern you observe
2. What the next value (x: ${datasetSize + 1}) might be
3. Your confidence level in this prediction

Provide a concise analysis.`;

            // Make prediction request using the new endpoint format
            const predictionResponse = await axios.post(
                `${baseURL}/v1/generateContent/${modelName}`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.4,
                        maxOutputTokens: 300
                    }
                }
            );

            return res.json({
                test: 'POST /test/prediction with random dataset',
                selectedModel: modelName,
                displayName: randomModel.displayName,
                dataset: dataset,
                datasetSize: datasetSize,
                prompt: prompt,
                response: predictionResponse.data
            });
        } catch (error: any) {
            return res.status(error.response?.status || 500).json({
                test: 'POST /test/prediction',
                error: error.message,
                details: error.response?.data
            });
        }
    });

    return router;
};
