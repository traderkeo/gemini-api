"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestRouter = void 0;
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../../config/env");
const predict_route_1 = require("./predict.route");
const stream_route_1 = require("./stream.route");
const createTestRouter = () => {
    const router = (0, express_1.Router)();
    // Register separate test routes
    (0, predict_route_1.registerPredictRoute)(router);
    (0, stream_route_1.registerStreamRoute)(router);
    const baseURL = `http://localhost:${env_1.env.PORT}`;
    // Test 1: Get a random model filtered by supportedGenerationMethods type
    router.get('/model', async (req, res) => {
        try {
            const type = req.query.type || 'generateContent';
            // Get all models
            const response = await axios_1.default.get(`${baseURL}/v1/models`);
            const allModels = response.data.models || [];
            // Filter by supportedGenerationMethods
            const filteredModels = allModels.filter((model) => {
                const methods = model.supportedGenerationMethods || [];
                return methods.includes(type);
            });
            if (filteredModels.length === 0) {
                return res.status(404).json({
                    error: `No models found with supportedGenerationMethods: ${type}`,
                    availableTypes: Array.from(new Set(allModels.flatMap((m) => m.supportedGenerationMethods || [])))
                });
            }
            // Select random model
            const randomModel = filteredModels[Math.floor(Math.random() * filteredModels.length)];
            const modelName = randomModel.name.replace('models/', '');
            // Get specific model details
            const modelResponse = await axios_1.default.get(`${baseURL}/v1/models/${modelName}`);
            return res.json({
                test: 'GET /test/model with type filter',
                requestedType: type,
                selectedModel: modelName,
                displayName: randomModel.displayName,
                totalMatchingModels: filteredModels.length,
                data: modelResponse.data
            });
        }
        catch (error) {
            return res.status(error.response?.status || 500).json({
                test: 'GET /test/model',
                error: error.message,
                details: error.response?.data
            });
        }
    });
    // Test 2: Test prediction with random numerical dataset and random predict model
    router.get('/prediction', async (_req, res) => {
        try {
            // Get all models that support 'generateContent' (excluding image models)
            const response = await axios_1.default.get(`${baseURL}/v1/models`);
            const allModels = response.data.models || [];
            // Filter models that support generateContent (text-based models, not image models)
            const textModels = allModels.filter((model) => {
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
            const predictionResponse = await axios_1.default.post(`${baseURL}/v1/generateContent/${modelName}`, {
                contents: [{
                        parts: [{
                                text: prompt
                            }]
                    }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 300
                }
            });
            return res.json({
                test: 'POST /test/prediction with random dataset',
                selectedModel: modelName,
                displayName: randomModel.displayName,
                dataset: dataset,
                datasetSize: datasetSize,
                prompt: prompt,
                response: predictionResponse.data
            });
        }
        catch (error) {
            return res.status(error.response?.status || 500).json({
                test: 'POST /test/prediction',
                error: error.message,
                details: error.response?.data
            });
        }
    });
    return router;
};
exports.createTestRouter = createTestRouter;
