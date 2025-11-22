"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStreamRoute = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../../config/env");
const registerStreamRoute = (router) => {
    const baseURL = `http://localhost:${env_1.env.PORT}`;
    // Data source endpoint - performs the actual test logic
    router.get('/stream/source', async (_req, res) => {
        try {
            const prompt = 'Write a short story about coding, apples, & cats.';
            const modelName = 'gemini-2.5-flash-lite';
            // Initiate stream request
            const response = await axios_1.default.post(`${baseURL}/v1/streamGenerateContent/${modelName}`, {
                contents: [{
                        parts: [{
                                text: prompt
                            }]
                    }]
            }, {
                responseType: 'stream'
            });
            // Proxy the stream back to the client
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            response.data.pipe(res);
        }
        catch (error) {
            if (!res.headersSent) {
                res.status(error.response?.status || 500).json({
                    error: 'Stream test failed',
                    details: error.response?.data || error.message
                });
            }
        }
    });
    // UI endpoint - serves the HTML test page
    router.get('/stream', async (_req, res) => {
        res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline'");
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Stream Test</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #e0e0e0; }
        #output { white-space: pre-wrap; background: #2a2a2a; padding: 15px; border-radius: 5px; margin-top: 10px; min-height: 100px; }
        .cursor { display: inline-block; width: 8px; height: 15px; background: #0f0; animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0; } }
    </style>
</head>
<body>
    <h2>Streaming Response Test</h2>
    <div>Status: <span id="status">Connecting...</span></div>
    <div id="output"><span class="cursor"></span></div>

    <script>
        const outputDiv = document.getElementById('output');
        const statusSpan = document.getElementById('status');
        const cursor = document.querySelector('.cursor');
        let textContent = '';

        // Connect to the source endpoint
        const eventSource = new EventSource('/test/stream/source');

        eventSource.onopen = () => {
            statusSpan.textContent = 'Connected, receiving stream...';
            statusSpan.style.color = '#0f0';
        };

        eventSource.onmessage = (event) => {
            if (event.data === '[DONE]') {
                eventSource.close();
                statusSpan.textContent = 'Completed';
                cursor.style.display = 'none';
                return;
            }

            try {
                const data = JSON.parse(event.data);
                // Debug: Log to console
                console.log('Chunk:', data);
                
                // Extract text from Gemini response structure
                // Candidate -> Content -> Parts -> Text
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                
                if (text) {
                    textContent += text;
                    // Insert text before the cursor
                    cursor.insertAdjacentText('beforebegin', text);
                } else {
                     // If no text found, maybe log it to the div for visibility
                     console.warn('No text in chunk:', data);
                     const debug = document.createElement('div');
                     debug.style.color = 'gray';
                     debug.style.fontSize = '0.8em';
                     debug.textContent = 'Empty/System chunk: ' + JSON.stringify(data);
                     outputDiv.appendChild(debug);
                }
            } catch (e) {
                console.error('Error parsing chunk:', e);
                const errDiv = document.createElement('div');
                errDiv.style.color = 'red';
                errDiv.textContent = 'Parse Error: ' + e.message;
                outputDiv.appendChild(errDiv);
            }
        };

        eventSource.onerror = (err) => {
            console.error('Stream error:', err);
            if (eventSource.readyState === EventSource.CLOSED) {
                statusSpan.textContent = 'Connection closed';
            } else {
                statusSpan.textContent = 'Error - see console';
                statusSpan.style.color = '#f00';
                eventSource.close();
            }
        };
    </script>
</body>
</html>
        `;
        res.send(html);
    });
};
exports.registerStreamRoute = registerStreamRoute;
