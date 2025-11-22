"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountTokensResponseSchema = exports.CountTokensRequestSchema = exports.GenerateContentResponseSchema = exports.GenerateContentRequestSchema = exports.ContentSchema = exports.PartSchema = exports.GenerationConfigSchema = exports.ResponseSchemaSchema = exports.SafetySettingSchema = void 0;
const zod_1 = require("zod");
// Safety Settings
exports.SafetySettingSchema = zod_1.z.object({
    category: zod_1.z.enum([
        'HARM_CATEGORY_HATE_SPEECH',
        'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'HARM_CATEGORY_DANGEROUS_CONTENT',
        'HARM_CATEGORY_HARASSMENT',
    ]),
    threshold: zod_1.z.enum([
        'BLOCK_NONE',
        'BLOCK_ONLY_HIGH',
        'BLOCK_MEDIUM_AND_ABOVE',
        'BLOCK_LOW_AND_ABOVE',
    ]),
});
// Response Schema (for JSON mode)
exports.ResponseSchemaSchema = zod_1.z.object({
    type: zod_1.z.string(),
    properties: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    required: zod_1.z.array(zod_1.z.string()).optional(),
    items: zod_1.z.any().optional(),
}).passthrough();
// Generation Config
exports.GenerationConfigSchema = zod_1.z.object({
    temperature: zod_1.z.number().optional(),
    topP: zod_1.z.number().optional(),
    topK: zod_1.z.number().optional(),
    candidateCount: zod_1.z.number().optional(),
    maxOutputTokens: zod_1.z.number().optional(),
    stopSequences: zod_1.z.array(zod_1.z.string()).optional(),
    responseMimeType: zod_1.z.string().optional(),
    responseSchema: exports.ResponseSchemaSchema.optional(),
});
// Content Parts
exports.PartSchema = zod_1.z.union([
    zod_1.z.object({ text: zod_1.z.string() }),
    zod_1.z.object({
        inlineData: zod_1.z.object({
            mimeType: zod_1.z.string(),
            data: zod_1.z.string(), // base64
        }),
    }),
    zod_1.z.object({
        fileData: zod_1.z.object({
            mimeType: zod_1.z.string(),
            fileUri: zod_1.z.string(),
        }),
    }),
]);
exports.ContentSchema = zod_1.z.object({
    role: zod_1.z.enum(['user', 'model', 'function']).optional(),
    parts: zod_1.z.array(exports.PartSchema),
});
// Request
exports.GenerateContentRequestSchema = zod_1.z.object({
    contents: zod_1.z.array(exports.ContentSchema),
    tools: zod_1.z.any().optional(), // Simplified for now
    safetySettings: zod_1.z.array(exports.SafetySettingSchema).optional(),
    generationConfig: exports.GenerationConfigSchema.optional(),
});
// Response (Simplified)
exports.GenerateContentResponseSchema = zod_1.z.object({
    candidates: zod_1.z.array(zod_1.z.object({
        content: exports.ContentSchema,
        finishReason: zod_1.z.string().optional(),
        index: zod_1.z.number().optional(),
        safetyRatings: zod_1.z.array(zod_1.z.object({
            category: zod_1.z.string(),
            probability: zod_1.z.string(),
        })).optional(),
    })).optional(),
    promptFeedback: zod_1.z.object({
        blockReason: zod_1.z.string().optional(),
    }).optional(),
});
// Count Tokens Request & Response
exports.CountTokensRequestSchema = zod_1.z.object({
    contents: zod_1.z.array(exports.ContentSchema),
});
exports.CountTokensResponseSchema = zod_1.z.object({
    totalTokens: zod_1.z.number(),
});
