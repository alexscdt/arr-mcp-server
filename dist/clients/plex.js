import { z } from 'zod';
import { HttpClient } from './base.js';
import { getConfig } from '../config.js';
const plexDirectorySchema = z.object({
    key: z.string(),
    type: z.string(),
    title: z.string(),
    agent: z.string().optional(),
    scanner: z.string().optional(),
    language: z.string().optional(),
    uuid: z.string().optional()
});
const plexLibraryResponseSchema = z.object({
    MediaContainer: z.object({
        size: z.number(),
        Directory: z.array(plexDirectorySchema).optional()
    })
});
const plexMediaItemSchema = z.object({
    ratingKey: z.string(),
    key: z.string(),
    guid: z.string().optional(),
    type: z.string(),
    title: z.string(),
    titleSort: z.string().optional(),
    originalTitle: z.string().optional(),
    year: z.number().optional(),
    summary: z.string().optional(),
    duration: z.number().optional(),
    rating: z.number().optional(),
    audienceRating: z.number().optional(),
    addedAt: z.number().optional(),
    updatedAt: z.number().optional(),
    viewCount: z.number().optional(),
    lastViewedAt: z.number().optional(),
    Genre: z
        .array(z.object({
        tag: z.string()
    }))
        .optional(),
    index: z.number().optional(),
    parentTitle: z.string().optional(),
    grandparentTitle: z.string().optional()
});
const plexLibraryContentsSchema = z.object({
    MediaContainer: z.object({
        size: z.number(),
        totalSize: z.number().optional(),
        Metadata: z.array(plexMediaItemSchema).optional()
    })
});
export class PlexClient {
    options;
    _http;
    constructor(options) {
        this.options = options;
    }
    get http() {
        if (!this._http) {
            const opts = this.options ?? getConfig().plex;
            this._http = new HttpClient({
                baseUrl: opts.url,
                headers: {
                    'X-Plex-Token': opts.token,
                    Accept: 'application/json'
                }
            });
        }
        return this._http;
    }
    async getLibraries() {
        const raw = await this.http.request({
            method: 'GET',
            path: '/library/sections'
        });
        const parsed = plexLibraryResponseSchema.parse(raw);
        return parsed.MediaContainer.Directory ?? [];
    }
    async getLibraryContents(sectionKey, options) {
        const query = {};
        if (options?.sort)
            query['sort'] = options.sort;
        if (options?.limit !== undefined)
            query['X-Plex-Container-Size'] = options.limit;
        if (options?.offset !== undefined)
            query['X-Plex-Container-Start'] = options.offset;
        const raw = await this.http.request({
            method: 'GET',
            path: `/library/sections/${sectionKey}/all`,
            query
        });
        const parsed = plexLibraryContentsSchema.parse(raw);
        return {
            items: parsed.MediaContainer.Metadata ?? [],
            totalSize: parsed.MediaContainer.totalSize ?? parsed.MediaContainer.size
        };
    }
    async getRecentlyAdded(sectionKey, limit = 20) {
        const path = sectionKey
            ? `/library/sections/${sectionKey}/recentlyAdded`
            : '/library/recentlyAdded';
        const raw = await this.http.request({
            method: 'GET',
            path,
            query: {
                'X-Plex-Container-Size': limit,
                'X-Plex-Container-Start': 0
            }
        });
        const parsed = plexLibraryContentsSchema.parse(raw);
        return parsed.MediaContainer.Metadata ?? [];
    }
    async searchLibrary(query) {
        const raw = await this.http.request({
            method: 'GET',
            path: '/search',
            query: { query }
        });
        const parsed = plexLibraryContentsSchema.parse(raw);
        return parsed.MediaContainer.Metadata ?? [];
    }
}
export const plexClient = new PlexClient();
//# sourceMappingURL=plex.js.map