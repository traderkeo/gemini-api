"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTextGenerationRouter = void 0;
const express_1 = require("express");
const createTextGenerationRouter = (controller) => {
    const router = (0, express_1.Router)();
    // POST /v1/textGeneration/streamGenerateContent/:model
    router.post('/streamGenerateContent/:model', controller.streamGenerateContent);
    // POST /v1/textGeneration/countTokens/:model
    router.post('/countTokens/:model', controller.countTokens);
    return router;
};
exports.createTextGenerationRouter = createTextGenerationRouter;
