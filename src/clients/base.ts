export interface HttpClientOptions {
    baseUrl: string
    headers?: Record<string, string>
    timeoutMs?: number
}

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    path: string
    query?: Record<string, string | number | boolean | undefined>
    body?: unknown
    headers?: Record<string, string>
}

export class HttpError extends Error {
    constructor(
        public readonly status: number,
        public readonly statusText: string,
        public readonly body: string,
        public readonly url: string
    ) {
        super(`HTTP ${status} ${statusText} on ${url}: ${body}`)
        this.name = 'HttpError'
    }
}

export class HttpClient {
    private readonly baseUrl: string
    private readonly defaultHeaders: Record<string, string>
    private readonly timeoutMs: number

    constructor(options: HttpClientOptions) {
        this.baseUrl = options.baseUrl.replace(/\/$/, '')
        this.defaultHeaders = options.headers ?? {}
        this.timeoutMs = options.timeoutMs ?? 15000
    }

    async request<T>(options: RequestOptions): Promise<T> {
        const url = this.buildUrl(options.path, options.query)
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

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
            })

            if (!response.ok) {
                const errorBody = await response.text()
                throw new HttpError(response.status, response.statusText, errorBody, url)
            }

            const contentType = response.headers.get('content-type') ?? ''
            if (contentType.includes('application/json')) {
                return (await response.json()) as T
            }

            return (await response.text()) as unknown as T
        } finally {
            clearTimeout(timeout)
        }
    }

    private buildUrl(path: string, query?: RequestOptions['query']): string {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`
        const url = new URL(`${this.baseUrl}${normalizedPath}`)

        if (query) {
            for (const [key, value] of Object.entries(query)) {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value))
                }
            }
        }

        return url.toString()
    }
}