import { GemBase } from '../../GemBase';
import {
    GenerateContentRequest,
    GenerateContentResponse,
    GenerateContentResponseSchema,
    CountTokensRequest,
    CountTokensResponse,
    CountTokensResponseSchema
} from '../../../../domain/types/gemini-requests';
import { Logger } from '../../../../config/logger';
import axios from 'axios';
export class GemTextGeneration extends GemBase {

    /**
     * Streams text generation responses for the specified model.
     */
    public async *streamGenerateContent(
        modelName: string,
        request: GenerateContentRequest
    ): AsyncGenerator<GenerateContentResponse, void, unknown> {
        const cleanName = modelName.startsWith('models/') ? modelName : `models/${modelName}`;

        if (request.generationConfig?.responseSchema && !request.generationConfig.responseMimeType) {
            Logger.info('Smart JSON Mode: Auto-setting responseMimeType to application/json');
            request.generationConfig.responseMimeType = 'application/json';
        }

        const axiosClient = axios.create();
        const endpoint = `/${cleanName}:streamGenerateContent?alt=sse`;

        try {
            const response = await axiosClient.post(endpoint, request, {
                responseType: 'stream',
                headers: {
                    Accept: 'text/event-stream',
                },
            });

            const stream = response.data;
            let buffer = '';

            for await (const chunk of stream) {
                const chunkStr = chunk.toString();
                buffer += chunkStr;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;

                    if (line.startsWith('data: ')) {
                        const jsonData = line.substring(6);
                        try {
                            const parsed = JSON.parse(jsonData);
                            const validated = await GenerateContentResponseSchema.parseAsync(parsed);
                            Logger.info(validated);
                            yield validated;
                        } catch (err) {
                            Logger.warn(`Failed to parse streaming chunk: ${err}`);
                        }
                    }
                }
            }

            if (buffer.trim() && buffer.startsWith('data: ')) {
                const jsonData = buffer.substring(6);
                try {
                    const parsed = JSON.parse(jsonData);
                    const validated = await GenerateContentResponseSchema.parseAsync(parsed);
                    yield validated;
                } catch (err) {
                    Logger.warn(`Failed to parse final streaming chunk: ${err}`);
                }
            }
        } catch (error) {
            Logger.error(`Streaming error: ${error}`);
            throw error;
        }
    }

    /**
     * Counts tokens for a given model prompt.
     */
    public async countTokens(modelName: string, request: CountTokensRequest): Promise<CountTokensResponse> {
        const cleanName = modelName.startsWith('models/') ? modelName : `models/${modelName}`;
        const endpoint = `/${cleanName}:countTokens`;

        const response = await this.post<CountTokensResponse>(endpoint, request);

        return CountTokensResponseSchema.parseAsync(response);
    }
}
