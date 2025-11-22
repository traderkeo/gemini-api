import { GemBase } from '../../GemBase';
import { GeminiModel, GeminiModelSchema, GeminiModelList, GeminiModelListSchema } from '../../../../domain/types/gemini-models';
import { CACHE_TTL } from '../../../../config/constants';

export class GemModels extends GemBase {

    public async getModel(name: string): Promise<GeminiModel> {
        const cleanName = name.startsWith('models/') ? name : `models/${name}`;
        const cacheKey = `gem:model:${cleanName}`;

        // 1. Check Cache
        const cached = await this.cache.get<GeminiModel>(cacheKey);
        if (cached) return cached;

        // 2. API Call
        const response = await this.get<GeminiModel>(`/${cleanName}`);

        // 3. Validation
        const parsed = await GeminiModelSchema.parseAsync(response);

        // 4. Update Cache
        await this.cache.set(cacheKey, parsed, CACHE_TTL.MODELS);

        return parsed;
    }

    public async listModels(pageSize: number = 1000): Promise<GeminiModelList> {
        const cacheKey = `gem:models:list:${pageSize}`;

        // 1. Check Cache
        const cached = await this.cache.get<GeminiModelList>(cacheKey);
        if (cached) {
            const { Logger } = await import('../../../../config/logger');
            Logger.info('Returning cached model list');
            return cached;
        }

        // 2. API Call
        // For simplicity, we are just fetching the first page as requested "up to 1000"
        // In a full implementation, we would handle pagination tokens recursively if needed.
        const response = await this.get<GeminiModelList>(`/models?pageSize=${pageSize}`);

        // 3. Debug Log
        const { Logger } = await import('../../../../config/logger');
        Logger.info(`Google API Response: ${JSON.stringify(response)}`);

        // 4. Validation
        const parsed = await GeminiModelListSchema.parseAsync(response);

        // 5. Update Cache
        await this.cache.set(cacheKey, parsed, CACHE_TTL.MODELS);

        return parsed;
    }
}
