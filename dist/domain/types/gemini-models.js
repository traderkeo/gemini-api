"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiModelListSchema = exports.GeminiModelSchema = void 0;
const zod_1 = require("zod");
exports.GeminiModelSchema = zod_1.z.object({
    name: zod_1.z.string(),
    version: zod_1.z.string().optional(),
    displayName: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    inputTokenLimit: zod_1.z.number().optional(),
    outputTokenLimit: zod_1.z.number().optional(),
    supportedGenerationMethods: zod_1.z.array(zod_1.z.string()).optional(),
    temperature: zod_1.z.number().optional(),
    topP: zod_1.z.number().optional(),
    topK: zod_1.z.number().optional(),
});
exports.GeminiModelListSchema = zod_1.z.object({
    models: zod_1.z.array(exports.GeminiModelSchema),
    nextPageToken: zod_1.z.string().optional(),
});
