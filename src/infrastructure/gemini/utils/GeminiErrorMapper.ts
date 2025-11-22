export class GeminiError extends Error {
    constructor(public message: string, public code: string, public status: number) {
        super(message);
        this.name = 'GeminiError';
    }
}

export class QuotaExceededError extends GeminiError {
    constructor(message: string) {
        super(message, 'QUOTA_EXCEEDED', 429);
    }
}

export class InvalidModelError extends GeminiError {
    constructor(message: string) {
        super(message, 'INVALID_MODEL', 404);
    }
}

export class GeminiErrorMapper {
    static map(error: any): GeminiError {
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
