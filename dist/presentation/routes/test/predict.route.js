"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPredictRoute = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../../config/env");
const registerPredictRoute = (router) => {
    const baseURL = `http://localhost:${env_1.env.PORT}`;
    router.get('/predict', async (_req, res) => {
        try {
            // Hardcoded input dataset
            const trainingData = [
                { input: '1', output: '10' },
                { input: '2', output: '20' },
                { input: '3', output: '30' },
                { input: '4', output: '40' }
            ];
            const prompt = `
            I have a pattern:
            ${trainingData.map(d => `Input: ${d.input}, Output: ${d.output}`).join('\n')}
            
            Based on this pattern, what is the output for Input: 5?
            Respond with just the number.
            `;
            // Using a standard model, assuming gemini-1.5-flash or gemini-pro is available.
            // If uncertain, we could fetch models first, but hardcoding for test is acceptable.
            const modelName = 'gemini-2.5-flash-lite';
            const response = await axios_1.default.post(`${baseURL}/v1/generateContent/${modelName}`, {
                contents: [{
                        parts: [{
                                text: prompt
                            }]
                    }]
            });
            return res.json({
                test: 'Hardcoded Prediction Test',
                dataset: trainingData,
                prompt,
                model: modelName,
                result: response.data
            });
        }
        catch (error) {
            return res.status(error.response?.status || 500).json({
                error: 'Prediction test failed',
                details: error.response?.data || error.message
            });
        }
    });
};
exports.registerPredictRoute = registerPredictRoute;
