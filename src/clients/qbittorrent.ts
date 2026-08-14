import { z } from 'zod'
import { HttpClient } from './base.js'
import { getConfig } from '../config.js'

const qbittorrentTorrentSchema = z.object({
    hash: z.string(),
    name: z.string(),
    size: z.number(),
    progress: z.number(),
    dlspeed: z.number(),
    upspeed: z.number(),
    eta: z.number(),
    state: z.string(),
    category: z.string().optional(),
    tags: z.string().optional(),
    save_path: z.string().optional(),
    content_path: z.string().optional(),
    added_on: z.number(),
    completion_on: z.number().optional(),
    num_seeds: z.number().optional(),
    num_leechs: z.number().optional(),
    ratio: z.number().optional()
})

export type QbittorrentTorrent = z.infer<typeof qbittorrentTorrentSchema>

export interface QbittorrentClientOptions {
    url: string
    username: string
    password: string
}

export class QbittorrentClient {
    private _http?: HttpClient
    private cookie: string | null = null
    private lastAuthAt: number = 0
    private readonly authTtlMs: number = 30 * 60 * 1000

    constructor(private readonly options?: QbittorrentClientOptions) {}

    private get creds(): QbittorrentClientOptions {
        return this.options ?? getConfig().qbittorrent
    }

    private get http(): HttpClient {
        if (!this._http) {
            this._http = new HttpClient({
                baseUrl: this.creds.url,
                timeoutMs: 15000
            })
        }
        return this._http
    }

    private async ensureAuthenticated(): Promise<void> {
        const now = Date.now()
        if (this.cookie && now - this.lastAuthAt < this.authTtlMs) {
            return
        }

        const params = new URLSearchParams({
            username: this.creds.username,
            password: this.creds.password
        })

        const response = await fetch(`${this.creds.url}/api/v2/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Referer: this.creds.url
            },
            body: params.toString()
        })

        if (!response.ok && response.status !== 204) {
            throw new Error(`qBittorrent auth failed: HTTP ${response.status}`)
        }

        const setCookie = response.headers.get('set-cookie')
        if (!setCookie) {
            throw new Error('qBittorrent auth did not return a session cookie (check credentials)')
        }

        const sidMatch = setCookie.match(/(QBT_SID(?:_\d+)?|SID)=([^;]+)/)
        if (!sidMatch) {
            throw new Error(`qBittorrent auth cookie did not contain a session id. Raw cookie: ${setCookie}`)
        }

        this.cookie = `${sidMatch[1]}=${sidMatch[2]}`
        this.lastAuthAt = now
    }

    async getTorrents(filter?: {
        filter?: 'all' | 'downloading' | 'seeding' | 'completed' | 'paused' | 'active' | 'inactive'
        category?: string
    }): Promise<QbittorrentTorrent[]> {
        await this.ensureAuthenticated()

        const query: Record<string, string> = {}
        if (filter?.filter) query.filter = filter.filter
        if (filter?.category) query.category = filter.category

        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v2/torrents/info',
            query,
            headers: {
                Cookie: this.cookie ?? ''
            }
        })

        return z.array(qbittorrentTorrentSchema).parse(raw)
    }
}

export const qbittorrentClient = new QbittorrentClient()