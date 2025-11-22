import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../config/logger';
import { GeminiError } from '../../infrastructure/gemini/utils/GeminiErrorMapper';
import { ZodError } from 'zod';

export const ErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    Logger.error(err);

    if (err instanceof GeminiError) {
        res.status(err.status).json({
            error: {
                message: err.message,
                code: err.code,
            },
        });
        return;
    }

    if (err instanceof ZodError) {
        res.status(400).json({
            error: {
                message: 'Validation Error',
                details: err.issues,
            },
        });
        return;
    }

    res.status(500).json({
        error: {
            message: 'Internal Server Error',
        },
    });
};
