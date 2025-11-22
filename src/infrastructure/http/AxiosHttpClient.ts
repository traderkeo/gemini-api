import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import https from 'https';
import http from 'http';
import { IHttpClient } from '../../domain/interfaces/IHttpClient';
import { Logger } from '../../config/logger';

export class AxiosHttpClient implements IHttpClient {
    private client: AxiosInstance;

    constructor(baseURL: string, apiKey: string) {
        // Create HTTP/HTTPS agents with Keep-Alive for performance
        // This reduces handshake overhead (up to 60-100ms per request)
        const httpsAgent = new https.Agent({
            keepAlive: true,
            maxSockets: Infinity,
            maxFreeSockets: 256,
            timeout: 60000,
        });

        const httpAgent = new http.Agent({
            keepAlive: true,
            maxSockets: Infinity,
            maxFreeSockets: 256,
            timeout: 60000,
        });

        this.client = axios.create({
            baseURL,
            params: { key: apiKey },
            headers: {
                'Content-Type': 'application/json',
            },
            httpsAgent,
            httpAgent,
        });

        // Interceptor for logging and error handling could go here
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    Logger.error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
                } else if (error.request) {
                    // The request was made but no response was received
                    Logger.error(`Network Error: ${error.message}`);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    Logger.error(`Request Error: ${error.message}`);
                }
                return Promise.reject(error);
            }
        );
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.get(url, config);
        return response.data;
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.post(url, data, config);
        return response.data;
    }

    public getClient(): AxiosInstance {
        return this.client;
    }
}
