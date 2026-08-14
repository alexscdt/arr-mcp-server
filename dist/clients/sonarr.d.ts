import { z } from 'zod';
declare const sonarrSeriesLookupSchema: z.ZodObject<{
    tvdbId: z.ZodNumber;
    tmdbId: z.ZodOptional<z.ZodNumber>;
    imdbId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    sortTitle: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodNumber>;
    overview: z.ZodOptional<z.ZodString>;
    network: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    runtime: z.ZodOptional<z.ZodNumber>;
    genres: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ratings: z.ZodOptional<z.ZodObject<{
        value: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        value?: number | undefined;
    }, {
        value?: number | undefined;
    }>>;
    remotePoster: z.ZodOptional<z.ZodString>;
    seasons: z.ZodOptional<z.ZodArray<z.ZodObject<{
        seasonNumber: z.ZodNumber;
        monitored: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        seasonNumber: number;
        monitored?: boolean | undefined;
    }, {
        seasonNumber: number;
        monitored?: boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    tvdbId: number;
    status?: string | undefined;
    tmdbId?: number | undefined;
    imdbId?: string | undefined;
    year?: number | undefined;
    overview?: string | undefined;
    runtime?: number | undefined;
    genres?: string[] | undefined;
    ratings?: {
        value?: number | undefined;
    } | undefined;
    remotePoster?: string | undefined;
    sortTitle?: string | undefined;
    network?: string | undefined;
    seasons?: {
        seasonNumber: number;
        monitored?: boolean | undefined;
    }[] | undefined;
}, {
    title: string;
    tvdbId: number;
    status?: string | undefined;
    tmdbId?: number | undefined;
    imdbId?: string | undefined;
    year?: number | undefined;
    overview?: string | undefined;
    runtime?: number | undefined;
    genres?: string[] | undefined;
    ratings?: {
        value?: number | undefined;
    } | undefined;
    remotePoster?: string | undefined;
    sortTitle?: string | undefined;
    network?: string | undefined;
    seasons?: {
        seasonNumber: number;
        monitored?: boolean | undefined;
    }[] | undefined;
}>;
export type SonarrSeriesLookup = z.infer<typeof sonarrSeriesLookupSchema>;
declare const sonarrSeriesSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodString;
    year: z.ZodOptional<z.ZodNumber>;
    tvdbId: z.ZodNumber;
    monitored: z.ZodBoolean;
    status: z.ZodString;
    seasonCount: z.ZodOptional<z.ZodNumber>;
    path: z.ZodOptional<z.ZodString>;
    statistics: z.ZodOptional<z.ZodObject<{
        episodeCount: z.ZodOptional<z.ZodNumber>;
        episodeFileCount: z.ZodOptional<z.ZodNumber>;
        sizeOnDisk: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        sizeOnDisk?: number | undefined;
        episodeCount?: number | undefined;
        episodeFileCount?: number | undefined;
    }, {
        sizeOnDisk?: number | undefined;
        episodeCount?: number | undefined;
        episodeFileCount?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    title: string;
    id: number;
    monitored: boolean;
    tvdbId: number;
    path?: string | undefined;
    year?: number | undefined;
    seasonCount?: number | undefined;
    statistics?: {
        sizeOnDisk?: number | undefined;
        episodeCount?: number | undefined;
        episodeFileCount?: number | undefined;
    } | undefined;
}, {
    status: string;
    title: string;
    id: number;
    monitored: boolean;
    tvdbId: number;
    path?: string | undefined;
    year?: number | undefined;
    seasonCount?: number | undefined;
    statistics?: {
        sizeOnDisk?: number | undefined;
        episodeCount?: number | undefined;
        episodeFileCount?: number | undefined;
    } | undefined;
}>;
export type SonarrSeries = z.infer<typeof sonarrSeriesSchema>;
declare const sonarrQualityProfileSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: number;
}, {
    name: string;
    id: number;
}>;
export type SonarrQualityProfile = z.infer<typeof sonarrQualityProfileSchema>;
declare const sonarrLanguageProfileSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: number;
}, {
    name: string;
    id: number;
}>;
export type SonarrLanguageProfile = z.infer<typeof sonarrLanguageProfileSchema>;
declare const sonarrRootFolderSchema: z.ZodObject<{
    id: z.ZodNumber;
    path: z.ZodString;
    freeSpace: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    path: string;
    id: number;
    freeSpace?: number | undefined;
}, {
    path: string;
    id: number;
    freeSpace?: number | undefined;
}>;
export type SonarrRootFolder = z.infer<typeof sonarrRootFolderSchema>;
declare const sonarrQueueItemSchema: z.ZodObject<{
    id: z.ZodNumber;
    seriesId: z.ZodOptional<z.ZodNumber>;
    episodeId: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    status: z.ZodString;
    size: z.ZodOptional<z.ZodNumber>;
    sizeleft: z.ZodOptional<z.ZodNumber>;
    timeleft: z.ZodOptional<z.ZodString>;
    estimatedCompletionTime: z.ZodOptional<z.ZodString>;
    errorMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: string;
    id: number;
    title?: string | undefined;
    size?: number | undefined;
    sizeleft?: number | undefined;
    timeleft?: string | undefined;
    estimatedCompletionTime?: string | undefined;
    errorMessage?: string | undefined;
    seriesId?: number | undefined;
    episodeId?: number | undefined;
}, {
    status: string;
    id: number;
    title?: string | undefined;
    size?: number | undefined;
    sizeleft?: number | undefined;
    timeleft?: string | undefined;
    estimatedCompletionTime?: string | undefined;
    errorMessage?: string | undefined;
    seriesId?: number | undefined;
    episodeId?: number | undefined;
}>;
export type SonarrQueueItem = z.infer<typeof sonarrQueueItemSchema>;
export interface AddSeriesOptions {
    tvdbId: number;
    title: string;
    qualityProfileId: number;
    languageProfileId?: number;
    rootFolderPath: string;
    monitored?: boolean;
    seasonFolder?: boolean;
    searchForMissingEpisodes?: boolean;
    monitor?: 'all' | 'future' | 'missing' | 'existing' | 'firstSeason' | 'latestSeason' | 'none';
    seasons?: Array<{
        seasonNumber: number;
        monitored: boolean;
    }>;
}
export interface SonarrClientOptions {
    url: string;
    apiKey: string;
}
export declare class SonarrClient {
    private readonly options?;
    private _http?;
    constructor(options?: SonarrClientOptions | undefined);
    private get http();
    lookup(term: string): Promise<SonarrSeriesLookup[]>;
    getSeries(): Promise<SonarrSeries[]>;
    getQualityProfiles(): Promise<SonarrQualityProfile[]>;
    getLanguageProfiles(): Promise<SonarrLanguageProfile[]>;
    getRootFolders(): Promise<SonarrRootFolder[]>;
    getQueue(): Promise<SonarrQueueItem[]>;
    addSeries(options: AddSeriesOptions): Promise<SonarrSeries>;
}
export declare const sonarrClient: SonarrClient;
export {};
