import { z } from 'zod';

export const GeminiModelSchema = z.object({
    name: z.string(),
    version: z.string().optional(),
    displayName: z.string().optional(),
    description: z.string().optional(),
    inputTokenLimit: z.number().optional(),
    outputTokenLimit: z.number().optional(),
    supportedGenerationMethods: z.array(z.string()).optional(),
    temperature: z.number().optional(),
    topP: z.number().optional(),
    topK: z.number().optional(),
});

export const GeminiModelListSchema = z.object({
    models: z.array(GeminiModelSchema),
    nextPageToken: z.string().optional(),
});

export type GeminiModel = z.infer<typeof GeminiModelSchema>;
export type GeminiModelList = z.infer<typeof GeminiModelListSchema>;
