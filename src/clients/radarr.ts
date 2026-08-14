import { z } from 'zod'
import { HttpClient } from './base.js'
import { getConfig } from '../config.js'

const radarrMovieLookupSchema = z.object({
    tmdbId: z.number(),
    imdbId: z.string().optional(),
    title: z.string(),
    originalTitle: z.string().optional(),
    year: z.number(),
    overview: z.string().optional(),
    runtime: z.number().optional(),
    genres: z.array(z.string()).optional(),
    ratings: z
        .object({
            tmdb: z.object({ value: z.number() }).optional(),
            imdb: z.object({ value: z.number() }).optional()
        })
        .optional(),
    remotePoster: z.string().optional()
})

export type RadarrMovieLookup = z.infer<typeof radarrMovieLookupSchema>

const radarrMovieSchema = z.object({
    id: z.number(),
    title: z.string(),
    year: z.number(),
    tmdbId: z.number(),
    hasFile: z.boolean(),
    monitored: z.boolean(),
    status: z.string(),
    sizeOnDisk: z.number().optional(),
    path: z.string().optional()
})

export type RadarrMovie = z.infer<typeof radarrMovieSchema>

const radarrQualityProfileSchema = z.object({
    id: z.number(),
    name: z.string()
})

export type RadarrQualityProfile = z.infer<typeof radarrQualityProfileSchema>

const radarrRootFolderSchema = z.object({
    id: z.number(),
    path: z.string(),
    freeSpace: z.number().optional()
})

export type RadarrRootFolder = z.infer<typeof radarrRootFolderSchema>

const radarrQueueItemSchema = z.object({
    id: z.number(),
    movieId: z.number().optional(),
    title: z.string().optional(),
    status: z.string(),
    size: z.number().optional(),
    sizeleft: z.number().optional(),
    timeleft: z.string().optional(),
    estimatedCompletionTime: z.string().optional(),
    errorMessage: z.string().optional()
})

export type RadarrQueueItem = z.infer<typeof radarrQueueItemSchema>

const radarrQueueResponseSchema = z.object({
    page: z.number(),
    pageSize: z.number(),
    totalRecords: z.number(),
    records: z.array(radarrQueueItemSchema)
})

export interface AddMovieOptions {
    tmdbId: number
    title: string
    year: number
    qualityProfileId: number
    rootFolderPath: string
    monitored?: boolean
    searchForMovie?: boolean
    minimumAvailability?: 'announced' | 'inCinemas' | 'released' | 'preDB'
}

export interface RadarrClientOptions {
    url: string
    apiKey: string
}

export class RadarrClient {
    private _http?: HttpClient

    constructor(private readonly options?: RadarrClientOptions) {}

    private get http(): HttpClient {
        if (!this._http) {
            const opts = this.options ?? getConfig().radarr
            this._http = new HttpClient({
                baseUrl: opts.url,
                headers: {
                    'X-Api-Key': opts.apiKey
                }
            })
        }
        return this._http
    }

    async lookup(term: string): Promise<RadarrMovieLookup[]> {
        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v3/movie/lookup',
            query: { term }
        })
        return z.array(radarrMovieLookupSchema).parse(raw)
    }

    async getMovies(): Promise<RadarrMovie[]> {
        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v3/movie'
        })
        return z.array(radarrMovieSchema).parse(raw)
    }

    async getQualityProfiles(): Promise<RadarrQualityProfile[]> {
        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v3/qualityprofile'
        })
        return z.array(radarrQualityProfileSchema).parse(raw)
    }

    async getRootFolders(): Promise<RadarrRootFolder[]> {
        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v3/rootfolder'
        })
        return z.array(radarrRootFolderSchema).parse(raw)
    }

    async getQueue(): Promise<RadarrQueueItem[]> {
        const raw = await this.http.request<unknown>({
            method: 'GET',
            path: '/api/v3/queue',
            query: { pageSize: 100 }
        })
        const parsed = radarrQueueResponseSchema.parse(raw)
        return parsed.records
    }

    async addMovie(options: AddMovieOptions): Promise<RadarrMovie> {
        const body = {
            tmdbId: options.tmdbId,
            title: options.title,
            year: options.year,
            qualityProfileId: options.qualityProfileId,
            rootFolderPath: options.rootFolderPath,
            monitored: options.monitored ?? true,
            minimumAvailability: options.minimumAvailability ?? 'released',
            addOptions: {
                searchForMovie: options.searchForMovie ?? true
            }
        }

        const raw = await this.http.request<unknown>({
            method: 'POST',
            path: '/api/v3/movie',
            body
        })

        return radarrMovieSchema.parse(raw)
    }
}

export const radarrClient = new RadarrClient()