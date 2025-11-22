# Browser-Based API Testing

## Overview
Simple test endpoints that run pre-configured calls to your `/v1/` API endpoints for easy browser-based verification.

## Available Test Endpoints

### 1. Test Model Retrieval
**Endpoint**: `GET /test/model`

**Query Parameters**:
- `type` (optional): Filter models by `supportedGenerationMethods`. Default: `generateContent`

**Description**: 
- Fetches all available models from `/v1/models`
- Filters by the specified generation method type
- Randomly selects one model from the filtered list
- Returns detailed information about the selected model

**Examples**:
```
http://localhost:3000/test/model
http://localhost:3000/test/model?type=generateContent
http://localhost:3000/test/model?type=countTokens
```

**Response Format**:
```json
{
  "test": "GET /test/model with type filter",
  "requestedType": "generateContent",
  "selectedModel": "gemini-1.5-flash",
  "displayName": "Gemini 1.5 Flash",
  "totalMatchingModels": 5,
  "data": {
    // Full model details
  }
}
```

### 2. Test Prediction with Random Dataset
**Endpoint**: `GET /test/prediction`

**Description**:
- Fetches all text-based models (excludes vision/image models)
- Randomly selects a model that supports `generateContent`
- Generates a random numerical dataset (5-14 data points)
- Sends a prediction/analysis request to the selected model
- Returns the dataset, prompt, and model's prediction response

**Example**:
```
http://localhost:3000/test/prediction
```

**Response Format**:
```json
{
  "test": "POST /test/prediction with random dataset",
  "selectedModel": "gemini-1.5-pro",
  "displayName": "Gemini 1.5 Pro",
  "dataset": [
    { "x": 1, "y": 45 },
    { "x": 2, "y": 23 },
    // ... more data points
  ],
  "datasetSize": 8,
  "prompt": "Given the following dataset: ...",
  "response": {
    // Model's prediction response
  }
}
```

## Random Selection
- **Model endpoint**: Randomly selects from models matching the requested `type`
- **Prediction endpoint**: Randomly selects from text-only models AND generates random numerical data
- Each refresh/request will use different random values

## Usage Tips

### Quick Testing
Simply paste these URLs in your browser:
- `http://localhost:3000/test/model`
- `http://localhost:3000/test/prediction`

### Test Different Model Types
Try different `type` parameters to find models with specific capabilities:
- `/test/model?type=generateContent` - Text generation models
- `/test/model?type=countTokens` - Token counting support  
- `/test/model?type=embedContent` - Embedding models

### JSON Formatting
Use a browser extension like "JSON Formatter" for better readability, or use DevTools:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click on the request
4. View formatted JSON in the Response tab

## Error Responses

If no models match the criteria:
```json
{
  "error": "No models found with supportedGenerationMethods: unknownType",
  "availableTypes": ["generateContent", "countTokens", "embedContent"]
}
```

If the API request fails:
```json
{
  "test": "GET /test/model",
  "error": "Request failed with status code 404",
  "details": {
    // Error details from the API
  }
}
```

## Benefits

✅ **No curl needed** - Just click a URL in your browser  
✅ **Random selection** - Different model/data each time for comprehensive testing  
✅ **Type filtering** - Test specific model capabilities  
✅ **Real data** - Uses actual models and generates realistic datasets  
✅ **Easy sharing** - Share test URLs with team members  
✅ **Visual output** - See JSON responses directly in browser
