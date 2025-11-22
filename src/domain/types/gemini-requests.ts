import { z } from 'zod';

// Safety Settings
export const SafetySettingSchema = z.object({
    category: z.enum([
        'HARM_CATEGORY_HATE_SPEECH',
        'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'HARM_CATEGORY_DANGEROUS_CONTENT',
        'HARM_CATEGORY_HARASSMENT',
    ]),
    threshold: z.enum([
        'BLOCK_NONE',
        'BLOCK_ONLY_HIGH',
        'BLOCK_MEDIUM_AND_ABOVE',
        'BLOCK_LOW_AND_ABOVE',
    ]),
});

// Response Schema (for JSON mode)
export const ResponseSchemaSchema = z.object({
    type: z.string(),
    properties: z.record(z.string(), z.any()).optional(),
    required: z.array(z.string()).optional(),
    items: z.any().optional(),
}).passthrough();

// Generation Config
export const GenerationConfigSchema = z.object({
    temperature: z.number().optional(),
    topP: z.number().optional(),
    topK: z.number().optional(),
    candidateCount: z.number().optional(),
    maxOutputTokens: z.number().optional(),
    stopSequences: z.array(z.string()).optional(),
    responseMimeType: z.string().optional(),
    responseSchema: ResponseSchemaSchema.optional(),
});

export const ToolConfigSchema = z.record(z.any());

// Content Parts
export const PartSchema = z.union([
    z.object({ text: z.string() }),
    z.object({
        inlineData: z.object({
            mimeType: z.string(),
            data: z.string(), // base64
        }),
    }),
    z.object({
        fileData: z.object({
            mimeType: z.string(),
            fileUri: z.string(),
        }),
    }),
]);

export const ContentSchema = z.object({
    role: z.enum(['user', 'model', 'function']).optional(),
    parts: z.array(PartSchema),
});

// Request
export const GenerateContentRequestSchema = z.object({
    contents: z.array(ContentSchema),
    tools: z.any().optional(), // Simplified for now
    toolConfig: ToolConfigSchema.optional(),
    safetySettings: z.array(SafetySettingSchema).optional(),
    systemInstruction: ContentSchema.optional(),
    generationConfig: GenerationConfigSchema.optional(),
    cachedContent: z.string().optional(),
});

// Response (Simplified)
export const GenerateContentResponseSchema = z.object({
    candidates: z.array(
        z.object({
            content: ContentSchema,
            finishReason: z.string().optional(),
            index: z.number().optional(),
            safetyRatings: z.array(
                z.object({
                    category: z.string(),
                    probability: z.string(),
                })
            ).optional(),
        })
    ).optional(),
    promptFeedback: z.object({
        blockReason: z.string().optional(),
    }).optional(),
});

// Count Tokens Request & Response
export const CountTokensRequestSchema = z.object({
    contents: z.array(ContentSchema),
});

export const CountTokensResponseSchema = z.object({
    totalTokens: z.number(),
});

export type SafetySetting = z.infer<typeof SafetySettingSchema>;
export type GenerationConfig = z.infer<typeof GenerationConfigSchema>;
export type ResponseSchema = z.infer<typeof ResponseSchemaSchema>;
export type Part = z.infer<typeof PartSchema>;
export type Content = z.infer<typeof ContentSchema>;
export type ToolConfig = z.infer<typeof ToolConfigSchema>;
export type GenerateContentRequest = z.infer<typeof GenerateContentRequestSchema>;
export type GenerateContentResponse = z.infer<typeof GenerateContentResponseSchema>;
export type CountTokensRequest = z.infer<typeof CountTokensRequestSchema>;
export type CountTokensResponse = z.infer<typeof CountTokensResponseSchema>;
