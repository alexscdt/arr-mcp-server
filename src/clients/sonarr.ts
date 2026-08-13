import { z } from 'zod'
import { HttpClient } from './base.js'
import { config } from '../config.js'

const sonarrSeriesLookupSchema = z.object({
    tvdbId: z.number(),
    tmdbId: z.number().optional(),
    imdbId: z.string().optional(),
    title: z.string(),
    sortTitle: z.string().optional(),
    year: z.number().optional(),
    overview: z.string().optional(),
    network: z.string().optional(),
    status: z.string().optional(),
    runtime: z.number().optional(),
    genres: z.array(z.string()).optional(),
    ratings: z
        .object({
            value: z.number().optional()
        })
        .optional(),
    remotePoster: z.string().optional(),
    seasons: z
        .array(
            z.object({
                seasonNumber: z.number(),
                monitored: z.boolean().optional()
            })
        )
        .optional()
})

export type SonarrSeriesLookup = z.infer<typeof sonarrSeriesLookupSchema>

const sonarrSeriesSchema = z.object({
    id: z.number(),
    title: z.string(),
    year: z.number().optional(),
    tvdbId: z.number(),
    monitored: z.boolean(),
    status: z.string(),
    seasonCount: z.number().optional(),
    path: z.string().optional(),
    statistics: z
        .object({
            episodeCount: z.number().optional(),
            episodeFileCount: z.number().optional(),
            sizeOnDisk: z.number().optional()
        })
        .optional()
})

export type SonarrSeries = z.infer<typeof sonarrSeriesSchema>

const sonarrQualityProfileSchema = z.object({
    id: z.number(),
    name: z.string()
})

export type SonarrQualityProfile = z.infer<typeof sonarrQualityProfileSchema>

const sonarrLanguageProfileSchema = z.object({
    id: z.number(),
    name: z.string()
})

export type SonarrLanguageProfile = z.infer<typeof sonarrLanguageProfileSchema>

const sonarrRootFolderSchema = z.object({
    id: z.number(),
    path: z.string(),
    freeSpace: z.number().optional()
})

export type SonarrRootFolder = z.infer<typeof sonarrRootFolderSchema>

const sonarrQueueItemSchema = z.object({
    id: z.number(),
    seriesId: z.number().optional(),
    episodeId: z.number().optional(),
    title: z.string().optional(),
    status: z.string(),
    size: z.number().optional(),
    sizeleft: z.number().optional(),
    timeleft: z.string().optional(),
    estimatedCompletionTime: z.string().optional(),
    errorMessage: z.string().optional()
})

export type SonarrQueueItem = z.infer<typeof sonarrQueueItemSchema>

const sonarrQueueResponseSchema = z.object({
    page: z.number(),
    pageSize: z.number(),
    totalRecords: z.number(),
    records: z.array(sonarrQueueItemSchema)
})

export interface AddSeriesOptions {
    tvdbId: number
    title: string
    qualityProfileId: number
    languageProfileId?: number
    rootFolderPath: string
    monitored?: boolean
    seasonFolder?: boolean
    searchForMissingEpisodes?: boolean
    monitor?: 'all' | 'future' | 'missing' | 'existing' | 'firstSeason' | 'latestSeason' | 'none'
    seasons?: Array<{ seasonNumber: number; monitored: boolean }>
}

export class SonarrClient {
    private readonly http: HttpClient

    constructor() {
        this.http = new HttpClient({
            baseUrl: config.sonarr.url,
            headers: {
                'X-Api-Key': config.sonarr.apiKey
            }
        })
    }

    async lookup(term: string): Promise<SonarrSeriesLookup[]> {
        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v3/series/lookup',
            query: { term }
        })
        return z.array(sonarrSeriesLookupSchema).parse(raw)
    }

    async getSeries(): Promise<SonarrSeries[]> {
        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v3/series'
        })
        return z.array(sonarrSeriesSchema).parse(raw)
    }

    async getQualityProfiles(): Promise<SonarrQualityProfile[]> {
        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v3/qualityprofile'
        })
        return z.array(sonarrQualityProfileSchema).parse(raw)
    }

    async getLanguageProfiles(): Promise<SonarrLanguageProfile[]> {
        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v3/languageprofile'
        })
        return z.array(sonarrLanguageProfileSchema).parse(raw)
    }

    async getRootFolders(): Promise<SonarrRootFolder[]> {
        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v3/rootfolder'
        })
        return z.array(sonarrRootFolderSchema).parse(raw)
    }

    async getQueue(): Promise<SonarrQueueItem[]> {
        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v3/queue',
            query: { pageSize: 100 }
        })
        const parsed = sonarrQueueResponseSchema.parse(raw)
        return parsed.records
    }

    async addSeries(options: AddSeriesOptions): Promise<SonarrSeries> {
        const body: Record<string, unknown> = {
            tvdbId: options.tvdbId,
            title: options.title,
            qualityProfileId: options.qualityProfileId,
            rootFolderPath: options.rootFolderPath,
            monitored: options.monitored ?? true,
            seasonFolder: options.seasonFolder ?? true,
            addOptions: {
                monitor: options.monitor ?? 'all',
                searchForMissingEpisodes: options.searchForMissingEpisodes ?? true
            }
        }

        if (options.languageProfileId !== undefined) {
            body.languageProfileId = options.languageProfileId
        }

        if (options.seasons) {
            body.seasons = options.seasons
        }

        const raw = await this.http.request<unknown>({
            method: 'POST',
            path: '/api/v3/series',
            body
        })

        return sonarrSeriesSchema.parse(raw)
    }
}

export const sonarrClient = new SonarrClient()