import { AxiosHttpClient } from '../http/AxiosHttpClient';
import { ICacheService } from '../../domain/interfaces/ICacheService';
import { GemModels } from './features/models/GemModels';
import { GemPredictions } from './features/predictions/GemPredictions';
import { GemTextGeneration } from './features/textGeneration/GemTextGeneration';
import { GEMINI_BASE_URL } from '../../config/constants';

export class Gem {
    public models: GemModels;
    public predictions: GemPredictions;
    public textGeneration: GemTextGeneration;

    constructor(apiKey: string, cacheService: ICacheService) {
        const httpClient = new AxiosHttpClient(GEMINI_BASE_URL, apiKey);

        // Initialize features
        this.models = new GemModels(httpClient, cacheService);
        this.predictions = new GemPredictions(httpClient, cacheService);
        this.textGeneration = new GemTextGeneration(httpClient, cacheService);
    }
}
