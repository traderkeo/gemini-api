"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class HttpException extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
exports.HttpException = HttpException;
const errorMiddleware = (error, req, res, _next) => {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    logger_1.default.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    res.status(status).json({
        success: false,
        status,
        message,
    });
};
exports.default = errorMiddleware;
