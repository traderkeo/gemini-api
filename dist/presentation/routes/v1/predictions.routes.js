"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPredictionsRouter = void 0;
const express_1 = require("express");
const createPredictionsRouter = (controller) => {
    const router = (0, express_1.Router)();
    // POST /v1/generateContent/:model - Generate content
    router.post('/generateContent/:model', controller.generateContent);
    return router;
};
exports.createPredictionsRouter = createPredictionsRouter;
