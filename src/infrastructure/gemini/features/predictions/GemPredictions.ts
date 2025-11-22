import { GemBase } from '../../GemBase';
import {
    GenerateContentRequest,
    GenerateContentResponse,
    GenerateContentResponseSchema,
} from '../../../../domain/types/gemini-requests';
import { RATE_LIMITS } from '../../../../config/constants';
import Bottleneck from 'bottleneck';
import { Logger } from '../../../../config/logger';

export class GemPredictions extends GemBase {

    /**
     * Generates content using the specified model.
     * Supports text, images, and tools.
     * Includes "Smart JSON Mode" - automatically sets responseMimeType if responseSchema is present.
     */
    public async generateContent(modelName: string, request: GenerateContentRequest): Promise<GenerateContentResponse> {
        const cleanName = modelName.startsWith('models/') ? modelName : `models/${modelName}`;

        // Smart Leveraging: Auto-set JSON MIME type if schema is present in config
        if (request.generationConfig?.responseSchema && !request.generationConfig?.responseMimeType) {
            Logger.info('Smart JSON Mode: Auto-setting responseMimeType to application/json');
            request.generationConfig.responseMimeType = 'application/json';
        }

        // Determine Rate Limiter based on model
        let limiterKey = 'gem:limiter:default';
        let limiterOptions: Bottleneck.ConstructorOptions = { minTime: 1000 }; // Default 60 RPM

        if (cleanName.includes('flash')) {
            limiterKey = 'gem:limiter:flash';
            limiterOptions = {
                minTime: 60000 / RATE_LIMITS.FLASH.RPM,
                reservoir: RATE_LIMITS.FLASH.RPM,
                reservoirRefreshAmount: RATE_LIMITS.FLASH.RPM,
                reservoirRefreshInterval: 60 * 1000
            };
        } else if (cleanName.includes('pro')) {
            limiterKey = 'gem:limiter:pro';
            limiterOptions = {
                minTime: 60000 / RATE_LIMITS.PRO.RPM,
                reservoir: RATE_LIMITS.PRO.RPM,
                reservoirRefreshAmount: RATE_LIMITS.PRO.RPM,
                reservoirRefreshInterval: 60 * 1000
            };
        }

        const limiter = this.getLimiter(limiterKey, limiterOptions);

        // Schedule the request
        return limiter.schedule(async () => {
            const response = await this.post<GenerateContentResponse>(`/${cleanName}:generateContent`, request);
            return GenerateContentResponseSchema.parseAsync(response);
        });
    }

}
