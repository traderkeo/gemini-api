"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiErrorMapper = exports.InvalidModelError = exports.QuotaExceededError = exports.GeminiError = void 0;
class GeminiError extends Error {
    constructor(message, code, status) {
        super(message);
        this.message = message;
        this.code = code;
        this.status = status;
        this.name = 'GeminiError';
    }
}
exports.GeminiError = GeminiError;
class QuotaExceededError extends GeminiError {
    constructor(message) {
        super(message, 'QUOTA_EXCEEDED', 429);
    }
}
exports.QuotaExceededError = QuotaExceededError;
class InvalidModelError extends GeminiError {
    constructor(message) {
        super(message, 'INVALID_MODEL', 404);
    }
}
exports.InvalidModelError = InvalidModelError;
class GeminiErrorMapper {
    static map(error) {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.error?.message || error.message;
            if (status === 429) {
                return new QuotaExceededError(message);
            }
            if (status === 404) {
                return new InvalidModelError(message);
            }
            return new GeminiError(message, 'API_ERROR', status);
        }
        return new GeminiError(error.message || 'Unknown Error', 'UNKNOWN_ERROR', 500);
    }
}
exports.GeminiErrorMapper = GeminiErrorMapper;
