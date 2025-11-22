import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

export const env = envSchema.parse(process.env);
