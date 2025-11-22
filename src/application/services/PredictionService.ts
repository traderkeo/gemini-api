import { Gem } from '../../infrastructure/gemini/Gem';
import {
    GenerateContentRequest,
    GenerateContentResponse,
} from '../../domain/types/gemini-requests';

export class PredictionService {
    constructor(private gem: Gem) { }

    /**
     * Generates content using the specified model.
     */
    public async generateContent(modelName: string, request: GenerateContentRequest): Promise<GenerateContentResponse> {
        return this.gem.predictions.generateContent(modelName, request);
    }

}
