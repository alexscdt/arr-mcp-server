export class HttpError extends Error {
    status;
    statusText;
    body;
    url;
    constructor(status, statusText, body, url) {
        super(`HTTP ${status} ${statusText} on ${url}: ${body}`);
        this.status = status;
        this.statusText = statusText;
        this.body = body;
        this.url = url;
        this.name = 'HttpError';
    }
}
export class HttpClient {
    baseUrl;
    defaultHeaders;
    timeoutMs;
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/$/, '');
        this.defaultHeaders = options.headers ?? {};
        this.timeoutMs = options.timeoutMs ?? 15000;
    }
    async request(options) {
        const url = this.buildUrl(options.path, options.query);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await fetch(url, {
                method: options.method ?? 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...this.defaultHeaders,
                    ...options.headers
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
                signal: controller.signal
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new HttpError(response.status, response.statusText, errorBody, url);
            }
            const contentType = response.headers.get('content-type') ?? '';
            if (contentType.includes('application/json')) {
                return (await response.json());
            }
            return (await response.text());
        }
        finally {
            clearTimeout(timeout);
        }
    }
    buildUrl(path, query) {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        const url = new URL(`${this.baseUrl}${normalizedPath}`);
        if (query) {
            for (const [key, value] of Object.entries(query)) {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            }
        }
        return url.toString();
    }
}
//# sourceMappingURL=base.js.map