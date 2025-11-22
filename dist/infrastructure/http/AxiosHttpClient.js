"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosHttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const logger_1 = require("../../config/logger");
class AxiosHttpClient {
    constructor(baseURL, apiKey) {
        // Create HTTP/HTTPS agents with Keep-Alive for performance
        // This reduces handshake overhead (up to 60-100ms per request)
        const httpsAgent = new https_1.default.Agent({
            keepAlive: true,
            maxSockets: Infinity,
            maxFreeSockets: 256,
            timeout: 60000,
        });
        const httpAgent = new http_1.default.Agent({
            keepAlive: true,
            maxSockets: Infinity,
            maxFreeSockets: 256,
            timeout: 60000,
        });
        this.client = axios_1.default.create({
            baseURL,
            params: { key: apiKey },
            headers: {
                'Content-Type': 'application/json',
            },
            httpsAgent,
            httpAgent,
        });
        // Interceptor for logging and error handling could go here
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                logger_1.Logger.error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            else if (error.request) {
                // The request was made but no response was received
                logger_1.Logger.error(`Network Error: ${error.message}`);
            }
            else {
                // Something happened in setting up the request that triggered an Error
                logger_1.Logger.error(`Request Error: ${error.message}`);
            }
            return Promise.reject(error);
        });
    }
    async get(url, config) {
        const response = await this.client.get(url, config);
        return response.data;
    }
    async post(url, data, config) {
        const response = await this.client.post(url, data, config);
        return response.data;
    }
    getClient() {
        return this.client;
    }
}
exports.AxiosHttpClient = AxiosHttpClient;
