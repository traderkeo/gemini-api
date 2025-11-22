"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModelsRouter = void 0;
const express_1 = require("express");
const createModelsRouter = (controller) => {
    const router = (0, express_1.Router)();
    router.get('/', controller.listModels);
    router.get('/generation-methods', controller.getGenerationMethods);
    router.get('/:name', controller.getModel);
    return router;
};
exports.createModelsRouter = createModelsRouter;
