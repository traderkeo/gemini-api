"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCountTokensRouter = void 0;
const express_1 = require("express");
const createCountTokensRouter = (controller) => {
    const router = (0, express_1.Router)();
    // POST /v1/countTokens/:model - Count tokens
    router.post('/:model', controller.countTokens);
    return router;
};
exports.createCountTokensRouter = createCountTokensRouter;
