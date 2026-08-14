import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpClient, HttpError } from '../../src/clients/base.js'

function jsonResponse(body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    })
}

function fetchSpy(response: () => Response): ReturnType<typeof vi.fn<(url: string, init: RequestInit) => Promise<Response>>> {
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => response())
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
}

describe('HttpClient', () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it('serializes query params and skips undefined values', async () => {
        const fetchMock = fetchSpy(() => jsonResponse({}))

        const client = new HttpClient({ baseUrl: 'http://api.local' })
        await client.request({
            path: '/items',
            query: { term: 'matrix', pageSize: 100, active: true, skipped: undefined }
        })

        expect(fetchMock.mock.calls[0]?.[0]).toBe('http://api.local/items?term=matrix&pageSize=100&active=true')
    })

    it('normalizes trailing slash on baseUrl and missing leading slash on path', async () => {
        const fetchMock = fetchSpy(() => jsonResponse({}))

        const client = new HttpClient({ baseUrl: 'http://api.local/' })
        await client.request({ path: 'items' })

        expect(fetchMock.mock.calls[0]?.[0]).toBe('http://api.local/items')
    })

    it('merges default and per-request headers', async () => {
        const fetchMock = fetchSpy(() => jsonResponse({}))

        const client = new HttpClient({
            baseUrl: 'http://api.local',
            headers: { 'X-Api-Key': 'secret' }
        })
        await client.request({ path: '/items', headers: { Cookie: 'SID=abc' } })

        expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
            'X-Api-Key': 'secret',
            Cookie: 'SID=abc',
            Accept: 'application/json'
        })
    })

    it('throws HttpError with status, body and url on non-ok responses', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response('nope', { status: 401, statusText: 'Unauthorized' }))
        )

        const client = new HttpClient({ baseUrl: 'http://api.local' })
        const promise = client.request({ path: '/secure' })

        await expect(promise).rejects.toBeInstanceOf(HttpError)
        await expect(client.request({ path: '/secure' })).rejects.toMatchObject({
            status: 401,
            body: 'nope',
            url: 'http://api.local/secure'
        })
    })

    it('parses JSON responses and returns raw text otherwise', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: true })))
        const client = new HttpClient({ baseUrl: 'http://api.local' })
        await expect(client.request({ path: '/json' })).resolves.toEqual({ ok: true })

        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response('plain text', { status: 200, headers: { 'content-type': 'text/plain' } }))
        )
        await expect(client.request({ path: '/text' })).resolves.toBe('plain text')
    })

    it('aborts the request after timeoutMs', async () => {
        vi.useFakeTimers()
        vi.stubGlobal(
            'fetch',
            vi.fn(
                (_url: string, init: RequestInit) =>
                    new Promise((_resolve, reject) => {
                        init.signal?.addEventListener('abort', () => {
                            reject(new Error('request aborted'))
                        })
                    })
            )
        )

        const client = new HttpClient({ baseUrl: 'http://api.local', timeoutMs: 50 })
        const assertion = expect(client.request({ path: '/slow' })).rejects.toThrow('request aborted')
        await vi.advanceTimersByTimeAsync(51)
        await assertion
    })
})
