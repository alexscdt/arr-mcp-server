import { z } from 'zod';
import { HttpClient } from './base.js';
import { getConfig } from '../config.js';
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
});
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
});
const radarrQualityProfileSchema = z.object({
    id: z.number(),
    name: z.string()
});
const radarrRootFolderSchema = z.object({
    id: z.number(),
    path: z.string(),
    freeSpace: z.number().optional()
});
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
});
const radarrQueueResponseSchema = z.object({
    page: z.number(),
    pageSize: z.number(),
    totalRecords: z.number(),
    records: z.array(radarrQueueItemSchema)
});
export class RadarrClient {
    options;
    _http;
    constructor(options) {
        this.options = options;
    }
    get http() {
        if (!this._http) {
            const opts = this.options ?? getConfig().radarr;
            this._http = new HttpClient({
                baseUrl: opts.url,
                headers: {
                    'X-Api-Key': opts.apiKey
                }
            });
        }
        return this._http;
    }
    async lookup(term) {
        const raw = await this.http.request({
            method: 'GET',
            path: '/api/v3/movie/lookup',
            query: { term }
        });
        return z.array(radarrMovieLookupSchema).parse(raw);
    }
    async getMovies() {
        const raw = await this.http.request({
            method: 'GET',
            path: '/api/v3/movie'
        });
        return z.array(radarrMovieSchema).parse(raw);
    }
    async getQualityProfiles() {
        const raw = await this.http.request({
            method: 'GET',
            path: '/api/v3/qualityprofile'
        });
        return z.array(radarrQualityProfileSchema).parse(raw);
    }
    async getRootFolders() {
        const raw = await this.http.request({
            method: 'GET',
            path: '/api/v3/rootfolder'
        });
        return z.array(radarrRootFolderSchema).parse(raw);
    }
    async getQueue() {
        const raw = await this.http.request({
            method: 'GET',
            path: '/api/v3/queue',
            query: { pageSize: 100 }
        });
        const parsed = radarrQueueResponseSchema.parse(raw);
        return parsed.records;
    }
    async addMovie(options) {
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
        };
        const raw = await this.http.request({
            method: 'POST',
            path: '/api/v3/movie',
            body
        });
        return radarrMovieSchema.parse(raw);
    }
}
export const radarrClient = new RadarrClient();
//# sourceMappingURL=radarr.js.map