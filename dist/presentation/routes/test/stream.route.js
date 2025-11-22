"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStreamRoute = void 0;
const env_1 = require("../../../config/env");
const Gem_1 = require("../../../infrastructure/gemini/Gem");
const MemoryCacheAdapter_1 = require("../../../infrastructure/cache/MemoryCacheAdapter");
const registerStreamRoute = (router) => {
    const gem = new Gem_1.Gem(env_1.env.GEMINI_API_KEY, new MemoryCacheAdapter_1.MemoryCacheAdapter());
    const streamHandler = async (res) => {
        const prompt = 'Write a short story about coding, apples, & cats.';
        const modelName = 'gemini-2.5-flash-lite';
        try {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            if (res.flushHeaders)
                res.flushHeaders();
            const stream = gem.textGeneration.stream({
                model: modelName,
                contents: prompt,
            });
            for await (const chunk of stream) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
                console.log(chunk);
                if (res.flush) {
                    res.flush();
                }
            }
            res.write('data: [DONE]\n\n');
            if (res.flush) {
                res.flush();
            }
            res.end();
        }
        catch (err) {
            // Handle axios connection errors before headers are sent
            if (!res.headersSent) {
                handleError(res, err);
            }
        }
    };
    const handleError = (res, error) => {
        if (!res.headersSent) {
            res.status(error.response?.status || 500).json({
                error: 'Stream test failed',
                details: error.response?.data || error.message
            });
        }
    };
    router.get('/stream/source', async (_req, res) => {
        try {
            await streamHandler(res);
        }
        catch (error) {
            handleError(res, error);
        }
    });
    router.get('/stream', async (_req, res) => {
        try {
            await streamHandler(res);
        }
        catch (error) {
            handleError(res, error);
        }
    });
    return router;
};
exports.registerStreamRoute = registerStreamRoute;
