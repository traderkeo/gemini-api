import { Gem } from '../../infrastructure/gemini/Gem';
import {
    GenerateContentRequest,
    GenerateContentResponse,
    CountTokensRequest,
    CountTokensResponse
} from '../../domain/types/gemini-requests';

export class TextGenerationService {
    constructor(private gem: Gem) { }

    /**
     * Streams text generation responses for the specified model.
     */
    public streamGenerateContent(
        modelName: string,
        request: GenerateContentRequest
    ): AsyncGenerator<GenerateContentResponse, void, unknown> {
        return this.gem.textGeneration.streamGenerateContent(modelName, request);
    }

    /**
     * Counts tokens for a given prompt.
     */
    public async countTokens(modelName: string, request: CountTokensRequest): Promise<CountTokensResponse> {
        return this.gem.textGeneration.countTokens(modelName, request);
    }
}
