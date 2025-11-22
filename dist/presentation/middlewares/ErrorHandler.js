"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const logger_1 = require("../../config/logger");
const GeminiErrorMapper_1 = require("../../infrastructure/gemini/utils/GeminiErrorMapper");
const zod_1 = require("zod");
const ErrorHandler = (err, _req, res, _next) => {
    logger_1.Logger.error(err);
    if (err instanceof GeminiErrorMapper_1.GeminiError) {
        res.status(err.status).json({
            error: {
                message: err.message,
                code: err.code,
            },
        });
        return;
    }
    if (err instanceof zod_1.ZodError) {
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
exports.ErrorHandler = ErrorHandler;
