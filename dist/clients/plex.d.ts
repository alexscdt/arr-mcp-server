import { z } from 'zod';
declare const plexDirectorySchema: z.ZodObject<{
    key: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    agent: z.ZodOptional<z.ZodString>;
    scanner: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    uuid: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    title: string;
    key: string;
    agent?: string | undefined;
    scanner?: string | undefined;
    language?: string | undefined;
    uuid?: string | undefined;
}, {
    type: string;
    title: string;
    key: string;
    agent?: string | undefined;
    scanner?: string | undefined;
    language?: string | undefined;
    uuid?: string | undefined;
}>;
export type PlexDirectory = z.infer<typeof plexDirectorySchema>;
declare const plexMediaItemSchema: z.ZodObject<{
    ratingKey: z.ZodString;
    key: z.ZodString;
    guid: z.ZodOptional<z.ZodString>;
    type: z.ZodString;
    title: z.ZodString;
    titleSort: z.ZodOptional<z.ZodString>;
    originalTitle: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodNumber>;
    summary: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    rating: z.ZodOptional<z.ZodNumber>;
    audienceRating: z.ZodOptional<z.ZodNumber>;
    addedAt: z.ZodOptional<z.ZodNumber>;
    updatedAt: z.ZodOptional<z.ZodNumber>;
    viewCount: z.ZodOptional<z.ZodNumber>;
    lastViewedAt: z.ZodOptional<z.ZodNumber>;
    Genre: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tag: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        tag: string;
    }, {
        tag: string;
    }>, "many">>;
    index: z.ZodOptional<z.ZodNumber>;
    parentTitle: z.ZodOptional<z.ZodString>;
    grandparentTitle: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    title: string;
    key: string;
    ratingKey: string;
    originalTitle?: string | undefined;
    year?: number | undefined;
    guid?: string | undefined;
    titleSort?: string | undefined;
    summary?: string | undefined;
    duration?: number | undefined;
    rating?: number | undefined;
    audienceRating?: number | undefined;
    addedAt?: number | undefined;
    updatedAt?: number | undefined;
    viewCount?: number | undefined;
    lastViewedAt?: number | undefined;
    Genre?: {
        tag: string;
    }[] | undefined;
    index?: number | undefined;
    parentTitle?: string | undefined;
    grandparentTitle?: string | undefined;
}, {
    type: string;
    title: string;
    key: string;
    ratingKey: string;
    originalTitle?: string | undefined;
    year?: number | undefined;
    guid?: string | undefined;
    titleSort?: string | undefined;
    summary?: string | undefined;
    duration?: number | undefined;
    rating?: number | undefined;
    audienceRating?: number | undefined;
    addedAt?: number | undefined;
    updatedAt?: number | undefined;
    viewCount?: number | undefined;
    lastViewedAt?: number | undefined;
    Genre?: {
        tag: string;
    }[] | undefined;
    index?: number | undefined;
    parentTitle?: string | undefined;
    grandparentTitle?: string | undefined;
}>;
export type PlexMediaItem = z.infer<typeof plexMediaItemSchema>;
export interface PlexClientOptions {
    url: string;
    token: string;
}
export declare class PlexClient {
    private readonly options?;
    private _http?;
    constructor(options?: PlexClientOptions | undefined);
    private get http();
    getLibraries(): Promise<PlexDirectory[]>;
    getLibraryContents(sectionKey: string, options?: {
        sort?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        items: PlexMediaItem[];
        totalSize: number;
    }>;
    getRecentlyAdded(sectionKey?: string, limit?: number): Promise<PlexMediaItem[]>;
    searchLibrary(query: string): Promise<PlexMediaItem[]>;
}
export declare const plexClient: PlexClient;
export {};
