export interface HttpClientOptions {
    baseUrl: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
}
export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    headers?: Record<string, string>;
}
export declare class HttpError extends Error {
    readonly status: number;
    readonly statusText: string;
    readonly body: string;
    readonly url: string;
    constructor(status: number, statusText: string, body: string, url: string);
}
export declare class HttpClient {
    private readonly baseUrl;
    private readonly defaultHeaders;
    private readonly timeoutMs;
    constructor(options: HttpClientOptions);
    request<T>(options: RequestOptions): Promise<T>;
    private buildUrl;
}
