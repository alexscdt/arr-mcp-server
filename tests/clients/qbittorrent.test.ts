import { afterEach, describe, expect, it, vi } from 'vitest'
import { QbittorrentClient } from '../../src/clients/qbittorrent.js'

const options = {
    url: 'http://qbit.local:8080',
    username: 'admin',
    password: 'adminadmin'
}

const torrentFixture = {
    hash: 'abc123',
    name: 'Some.Movie.2024.1080p',
    size: 1000,
    progress: 0.5,
    dlspeed: 500,
    upspeed: 0,
    eta: 3600,
    state: 'downloading',
    category: 'radarr',
    added_on: 1700000000
}

function loginResponse(setCookie: string | null): Response {
    const response = new Response('Ok.', { status: 200 })
    vi.spyOn(response.headers, 'get').mockImplementation((name: string) =>
        name.toLowerCase() === 'set-cookie' ? setCookie : null
    )
    return response
}

function torrentsResponse(): Response {
    return new Response(JSON.stringify([torrentFixture]), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    })
}

function stubFetch(setCookie: string | null): ReturnType<typeof vi.fn> {
    const fetchMock = vi.fn(async (url: string) => {
        if (url.includes('/api/v2/auth/login')) {
            return loginResponse(setCookie)
        }
        return torrentsResponse()
    })
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
}

describe('QbittorrentClient', () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it('logs in with form credentials and sends the session cookie on torrent requests', async () => {
        const fetchMock = stubFetch('SID=abc123; HttpOnly; path=/')

        const client = new QbittorrentClient(options)
        const torrents = await client.getTorrents({ filter: 'active' })

        const [loginUrl, loginInit] = fetchMock.mock.calls[0] as [string, RequestInit]
        expect(loginUrl).toBe('http://qbit.local:8080/api/v2/auth/login')
        expect(loginInit.method).toBe('POST')
        expect(loginInit.body).toBe('username=admin&password=adminadmin')
        expect(loginInit.headers).toMatchObject({ Referer: options.url })

        const [torrentsUrl, torrentsInit] = fetchMock.mock.calls[1] as [string, RequestInit]
        expect(torrentsUrl).toContain('/api/v2/torrents/info?filter=active')
        expect(torrentsInit.headers).toMatchObject({ Cookie: 'SID=abc123' })

        expect(torrents).toHaveLength(1)
        expect(torrents[0]?.name).toBe(torrentFixture.name)
    })

    it('matches QBT_SID cookie variants', async () => {
        const fetchMock = stubFetch('QBT_SID_2=xyz789; HttpOnly')

        const client = new QbittorrentClient(options)
        await client.getTorrents()

        const torrentsInit = fetchMock.mock.calls[1]?.[1] as RequestInit
        expect(torrentsInit.headers).toMatchObject({ Cookie: 'QBT_SID_2=xyz789' })
    })

    it('throws when the login response has no session cookie', async () => {
        stubFetch(null)

        const client = new QbittorrentClient(options)
        await expect(client.getTorrents()).rejects.toThrow('did not return a session cookie')
    })

    it('reuses the session within the TTL and re-authenticates after it expires', async () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-08-14T12:00:00Z'))
        const fetchMock = stubFetch('SID=abc123; HttpOnly')

        const client = new QbittorrentClient(options)
        await client.getTorrents()
        await client.getTorrents()

        const loginCalls = (): number =>
            fetchMock.mock.calls.filter(([url]) => (url as string).includes('/auth/login')).length
        expect(loginCalls()).toBe(1)

        vi.setSystemTime(new Date('2026-08-14T12:31:00Z'))
        await client.getTorrents()
        expect(loginCalls()).toBe(2)
    })
})
