"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStreamGenerateContentRouter = void 0;
const express_1 = require("express");
const createStreamGenerateContentRouter = (controller) => {
    const router = (0, express_1.Router)();
    // POST /v1/streamGenerateContent/:model - Stream content generation
    router.post('/:model', controller.streamGenerateContent);
    return router;
};
exports.createStreamGenerateContentRouter = createStreamGenerateContentRouter;
