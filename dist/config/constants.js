"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = exports.CACHE_TTL = exports.GEMINI_BASE_URL = void 0;
exports.GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
exports.CACHE_TTL = {
    MODELS: 86400, // 24 hours
};
exports.RATE_LIMITS = {
    FLASH: {
        RPM: 15,
        TPM: 1000000,
    },
    PRO: {
        RPM: 2,
        TPM: 32000,
    },
    EMBEDDINGS: {
        RPM: 1500,
    },
};
