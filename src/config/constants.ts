export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export const CACHE_TTL = {
    MODELS: 86400, // 24 hours
};

export const RATE_LIMITS = {
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
