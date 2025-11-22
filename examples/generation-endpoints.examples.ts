/**
 * Test Examples for New Generation Endpoints
 * 
 * These examples demonstrate how to use the new generation endpoints.
 * You can test them using curl, Postman, or the /test dashboard.
 */

// Example 1: Standard Generation with Smart JSON Mode
export const exampleGenerateWithJsonSchema = {
    endpoint: 'POST /v1/generateContent/gemini-1.5-flash',
    description: 'Generate structured JSON output using responseSchema. Smart JSON mode will auto-set responseMimeType.',
    request: {
        contents: [
            {
                parts: [
                    {
                        text: 'List 3 popular programming languages with their primary use cases'
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
            responseSchema: {
                type: 'object',
                properties: {
                    languages: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                useCase: { type: 'string' },
                                popularity: { type: 'string' }
                            },
                            required: ['name', 'useCase', 'popularity']
                        }
                    }
                },
                required: ['languages']
            }
        }
    }
};

// Example 2: Streaming Generation
export const exampleStreamGeneration = {
    endpoint: 'POST /v1/streamGenerateContent/gemini-1.5-flash',
    description: 'Stream content in real-time using Server-Sent Events (SSE)',
    request: {
        contents: [
            {
                parts: [
                    {
                        text: 'Write a short story about a robot learning to paint. Make it 3 paragraphs.'
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1024
        }
    },
    clientExample: `
// JavaScript/TypeScript client example
async function streamGenerate() {
  const response = await fetch('/v1/streamGenerateContent/gemini-1.5-flash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Tell me a joke' }] }]
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        const data = JSON.parse(line.substring(6));
        console.log(data.candidates[0].content.parts[0].text);
      }
    }
  }
}
  `
};

// Example 3: Token Counting (Cost Estimation)
export const exampleCountTokens = {
    endpoint: 'POST /v1/countTokens/gemini-1.5-flash',
    description: 'Count tokens before making expensive API calls',
    request: {
        contents: [
            {
                parts: [
                    {
                        text: `This is a sample text to count tokens. 
            It can be useful to estimate costs before sending large prompts.
            The more text you have, the more tokens it will consume.`
                    }
                ]
            }
        ]
    },
    expectedResponse: {
        totalTokens: 42  // Example number
    }
};

// Example 4: Multimodal Input (Text + Image)
export const exampleMultimodal = {
    endpoint: 'POST /v1/generateContent/gemini-1.5-flash',
    description: 'Process text and images together',
    request: {
        contents: [
            {
                parts: [
                    {
                        text: 'What do you see in this image? Describe it in detail.'
                    },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: '<base64-encoded-image-data-here>'
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 500
        }
    }
};

// Example 5: Safety Settings
export const exampleWithSafety = {
    endpoint: 'POST /v1/generateContent/gemini-1.5-flash',
    description: 'Control content safety thresholds',
    request: {
        contents: [
            {
                parts: [
                    {
                        text: 'Tell me about the history of video games'
                    }
                ]
            }
        ],
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
        ],
        generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1024
        }
    }
};

// Example 6: Advanced JSON Schema (Nested Objects)
export const exampleComplexJsonSchema = {
    endpoint: 'POST /v1/generateContent/gemini-1.5-flash',
    description: 'Generate complex nested JSON structures',
    request: {
        contents: [
            {
                parts: [
                    {
                        text: 'Create a product catalog with 2 products, each with name, price, and 2 features'
                    }
                ]
            }
        ],
        generationConfig: {
            responseSchema: {
                type: 'object',
                properties: {
                    catalog: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                productName: { type: 'string' },
                                price: { type: 'number' },
                                currency: { type: 'string' },
                                features: {
                                    type: 'array',
                                    items: { type: 'string' }
                                },
                                inStock: { type: 'boolean' }
                            },
                            required: ['productName', 'price', 'currency', 'features', 'inStock']
                        }
                    }
                },
                required: ['catalog']
            }
        }
    }
};

// CURL Commands for Testing

export const curlExamples = {
    standardGeneration: `
curl -X POST http://localhost:3000/v1/generateContent/gemini-1.5-flash \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{
      "parts": [{
        "text": "Explain quantum computing in simple terms"
      }]
    }],
    "generationConfig": {
      "temperature": 0.7,
      "maxOutputTokens": 256
    }
  }'
  `,

    streamingGeneration: `
curl -X POST http://localhost:3000/v1/streamGenerateContent/gemini-1.5-flash \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{
      "parts": [{
        "text": "Write a haiku about coding"
      }]
    }]
  }' \\
  --no-buffer
  `,

    countTokens: `
curl -X POST http://localhost:3000/v1/countTokens/gemini-1.5-flash \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{
      "parts": [{
        "text": "This is a test message to count tokens"
      }]
    }]
  }'
  `,

    jsonMode: `
curl -X POST http://localhost:3000/v1/generateContent/gemini-1.5-flash \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{
      "parts": [{
        "text": "List 3 colors with their hex codes"
      }]
    }],
    "generationConfig": {
      "responseSchema": {
        "type": "object",
        "properties": {
          "colors": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "hex": { "type": "string" }
              }
            }
          }
        }
      }
    }
  }'
  `
};

console.log('📚 Generation Endpoints Test Examples Loaded');
console.log('📖 See GENERATION_ENDPOINTS.md for full documentation');
