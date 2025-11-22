# Gem Library - Generation Endpoints

This document describes the new generation endpoints added to the Gem library based on the high-performance architectural design.

## Overview

The Gem library now supports three main generation endpoints:
1. **generateContent** - Standard content generation
2. **textGeneration/streamGenerateContent** - Real-time streaming for better perceived performance  
3. **textGeneration/countTokens** - Token counting for cost control

## Features

### 🎯 Smart JSON Mode
When you provide a `responseSchema` in your `generationConfig`, the library automatically sets `responseMimeType` to `application/json`. No manual configuration needed!

### ⚡ HTTP Keep-Alive
All requests use persistent HTTP connections, reducing handshake overhead by 60-100ms per request.

### 🔄 Rate Limiting
Built-in distributed rate limiting per model type:
- **Flash models**: 15 RPM (configurable)
- **Pro models**: 2 RPM (configurable)
- Automatic retry with exponential backoff on 429 errors

### 🔒 Type Safety
All requests and responses are validated using Zod schemas at runtime, ensuring type safety beyond compile time.

## API Endpoints

All endpoints are prefixed with `/v1`. Each generation method has its own dedicated route:

### 1. Generate Content

**Endpoint:** `POST /v1/generateContent/:model`

**Example Request:**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Write a story about a magic backpack."
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 1024
  }
}
```

**Example Response:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Once upon a time, there was a magic backpack..."
          }
        ]
      },
      "finishReason": "STOP"
    }
  ]
}
```

### 2. Text Generation Streaming

**Endpoint:** `POST /v1/textGeneration/streamGenerateContent/:model`

**Description:** Streams text-only responses back to clients via Server-Sent Events (SSE) using the dedicated textGeneration feature for better separation of concerns.

**Example Request:**
Same as generateContent above.

**Response Format (SSE):**
```
data: {"candidates":[{"content":{"parts":[{"text":"Once"}]}}]}

data: {"candidates":[{"content":{"parts":[{"text":" upon"}]}}]}

data: {"candidates":[{"content":{"parts":[{"text":" a time"}]}}]}

data: [DONE]
```

**Client-Side Example (JavaScript):**
```javascript
const response = await fetch('/v1/textGeneration/streamGenerateContent/gemini-1.5-flash', {
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
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      const data = JSON.parse(line.substring(6));
      console.log(data.candidates[0].content.parts[0].text);
    }
  }
}
```

### 3. Text Generation Token Counting

**Endpoint:** `POST /v1/textGeneration/countTokens/:model`

**Description:** Count tokens via the textGeneration namespace to estimate cost before making expensive streaming or batch requests.

**Example Request:**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "This is a sample text to count tokens."
        }
      ]
    }
  ]
}
```

**Example Response:**
```json
{
  "totalTokens": 42
}
```

## Advanced Features

### Multimodal Input (Images)

You can include images inline (base64) or via file URIs:

**Inline Image:**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "What's in this image?"
        },
        {
          "inlineData": {
            "mimeType": "image/jpeg",
            "data": "<base64-encoded-image>"
          }
        }
      ]
    }
  ]
}
```

**File URI:**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Describe this image"
        },
        {
          "fileData": {
            "mimeType": "image/jpeg",
            "fileUri": "gs://bucket/image.jpg"
          }
        }
      ]
    }
  ]
}
```

### JSON Output with Schema Validation

Use `responseSchema` to get structured JSON output:

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "List 3 popular programming languages with their use cases"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseSchema": {
      "type": "object",
      "properties": {
        "languages": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "useCase": { "type": "string" }
            },
            "required": ["name", "useCase"]
          }
        }
      },
      "required": ["languages"]
    }
  }
}
```

**Note:** When `responseSchema` is provided, `responseMimeType` is automatically set to `application/json` (Smart JSON Mode).

### Safety Settings

Control content safety thresholds:

```json
{
  "contents": [
    {
      "parts": [{ "text": "Your prompt here" }]
    }
  ],
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
}
```

Available categories:
- `HARM_CATEGORY_HATE_SPEECH`
- `HARM_CATEGORY_SEXUALLY_EXPLICIT`
- `HARM_CATEGORY_DANGEROUS_CONTENT`
- `HARM_CATEGORY_HARASSMENT`

Available thresholds:
- `BLOCK_NONE`
- `BLOCK_ONLY_HIGH`
- `BLOCK_MEDIUM_AND_ABOVE`
- `BLOCK_LOW_AND_ABOVE`

## Configuration

### Rate Limits

Rate limits are configured in `src/config/constants.ts`:

```typescript
export const RATE_LIMITS = {
    FLASH: {
        RPM: 15,        // Requests per minute
        TPM: 1000000,   // Tokens per minute
    },
    PRO: {
        RPM: 2,
        TPM: 32000,
    },
    EMBEDDINGS: {
        RPM: 1500,
    },
};
```

### Redis (Optional)

Redis is used for distributed rate limiting when multiple server instances are running. If Redis is not available, the library falls back to local rate limiting.

**Docker Compose:**
```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

**Enable Redis rate limiting in `GemBase.ts`:**
```typescript
// Uncomment these lines in the getLimiter method:
datastore: 'redis',
clientOptions: { host: 'localhost', port: 6379 }
```

## Error Handling

The library automatically handles:
- **429 Too Many Requests**: Exponential backoff with jitter
- **500+ Server Errors**: Automatic retry
- **Validation Errors**: Zod schema validation on responses

Errors are logged and propagated to the Express error handler middleware.

## Performance Optimization

### Keep-Alive Connections
HTTP/HTTPS agents are configured with keep-alive, reducing connection overhead:
- **maxSockets**: Infinity (no connection limit)
- **maxFreeSockets**: 256
- **timeout**: 60 seconds

### Caching
Model metadata is cached in Redis (optional) with a 24-hour TTL to reduce unnecessary API calls.

### Streaming Benefits
Using `streamGenerateContent` provides:
- Lower Time to First Token (TTFT)
- Better perceived performance
- Ability to display content progressively

## Testing

Test the endpoints using the included test routes:

```bash
# Start the server
npm run dev

# Visit the test dashboard
# http://localhost:3000/test
```

## Architecture

The implementation follows Clean Architecture principles:

```
src/
├── domain/types/          # Type definitions and schemas
├── infrastructure/
│   ├── gemini/
│   │   ├── GemBase.ts    # Base class with rate limiting
│   │   └── features/
│   │       └── predictions/
│   │           └── GemPredictions.ts  # Prediction logic
│   ├── http/
│   │   └── AxiosHttpClient.ts        # HTTP client with keep-alive
├── application/services/
│   └── PredictionService.ts          # Business logic layer
└── presentation/
    ├── controllers/
    │   └── PredictionsController.ts  # HTTP handlers
    └── routes/
        └── v1/
            └── predictions.routes.ts # Route definitions
```

## References

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Architectural Design Document](./step1.md)

---

Built with ❤️ following high-performance architectural patterns for enterprise-grade AI applications.
