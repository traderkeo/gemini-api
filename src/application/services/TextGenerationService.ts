import { Gem } from '../../infrastructure/gemini/Gem';
import {
    GenerateContentRequest,
    GenerateContentResponse,
    CountTokensRequest,
    CountTokensResponse
} from '../../domain/types/gemini-requests';
import { StreamRequest } from '../../infrastructure/gemini/features/textGeneration/GemTextGeneration';

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
     * Convenience wrapper that matches the new SDK-style stream signature.
     */
    public stream(
        request: StreamRequest
    ): AsyncGenerator<{ text: string }, void, unknown> {
        return this.gem.textGeneration.stream(request);
    }

    /**
     * Counts tokens for a given prompt.
     */
    public async countTokens(modelName: string, request: CountTokensRequest): Promise<CountTokensResponse> {
        return this.gem.textGeneration.countTokens(modelName, request);
    }
}
