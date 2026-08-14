import { z } from 'zod';
declare const radarrMovieLookupSchema: z.ZodObject<{
    tmdbId: z.ZodNumber;
    imdbId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    originalTitle: z.ZodOptional<z.ZodString>;
    year: z.ZodNumber;
    overview: z.ZodOptional<z.ZodString>;
    runtime: z.ZodOptional<z.ZodNumber>;
    genres: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ratings: z.ZodOptional<z.ZodObject<{
        tmdb: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: number;
        }, {
            value: number;
        }>>;
        imdb: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: number;
        }, {
            value: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        tmdb?: {
            value: number;
        } | undefined;
        imdb?: {
            value: number;
        } | undefined;
    }, {
        tmdb?: {
            value: number;
        } | undefined;
        imdb?: {
            value: number;
        } | undefined;
    }>>;
    remotePoster: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    tmdbId: number;
    year: number;
    imdbId?: string | undefined;
    originalTitle?: string | undefined;
    overview?: string | undefined;
    runtime?: number | undefined;
    genres?: string[] | undefined;
    ratings?: {
        tmdb?: {
            value: number;
        } | undefined;
        imdb?: {
            value: number;
        } | undefined;
    } | undefined;
    remotePoster?: string | undefined;
}, {
    title: string;
    tmdbId: number;
    year: number;
    imdbId?: string | undefined;
    originalTitle?: string | undefined;
    overview?: string | undefined;
    runtime?: number | undefined;
    genres?: string[] | undefined;
    ratings?: {
        tmdb?: {
            value: number;
        } | undefined;
        imdb?: {
            value: number;
        } | undefined;
    } | undefined;
    remotePoster?: string | undefined;
}>;
export type RadarrMovieLookup = z.infer<typeof radarrMovieLookupSchema>;
declare const radarrMovieSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodString;
    year: z.ZodNumber;
    tmdbId: z.ZodNumber;
    hasFile: z.ZodBoolean;
    monitored: z.ZodBoolean;
    status: z.ZodString;
    sizeOnDisk: z.ZodOptional<z.ZodNumber>;
    path: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: string;
    title: string;
    tmdbId: number;
    year: number;
    id: number;
    hasFile: boolean;
    monitored: boolean;
    path?: string | undefined;
    sizeOnDisk?: number | undefined;
}, {
    status: string;
    title: string;
    tmdbId: number;
    year: number;
    id: number;
    hasFile: boolean;
    monitored: boolean;
    path?: string | undefined;
    sizeOnDisk?: number | undefined;
}>;
export type RadarrMovie = z.infer<typeof radarrMovieSchema>;
declare const radarrQualityProfileSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: number;
}, {
    name: string;
    id: number;
}>;
export type RadarrQualityProfile = z.infer<typeof radarrQualityProfileSchema>;
declare const radarrRootFolderSchema: z.ZodObject<{
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
export type RadarrRootFolder = z.infer<typeof radarrRootFolderSchema>;
declare const radarrQueueItemSchema: z.ZodObject<{
    id: z.ZodNumber;
    movieId: z.ZodOptional<z.ZodNumber>;
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
    movieId?: number | undefined;
    size?: number | undefined;
    sizeleft?: number | undefined;
    timeleft?: string | undefined;
    estimatedCompletionTime?: string | undefined;
    errorMessage?: string | undefined;
}, {
    status: string;
    id: number;
    title?: string | undefined;
    movieId?: number | undefined;
    size?: number | undefined;
    sizeleft?: number | undefined;
    timeleft?: string | undefined;
    estimatedCompletionTime?: string | undefined;
    errorMessage?: string | undefined;
}>;
export type RadarrQueueItem = z.infer<typeof radarrQueueItemSchema>;
export interface AddMovieOptions {
    tmdbId: number;
    title: string;
    year: number;
    qualityProfileId: number;
    rootFolderPath: string;
    monitored?: boolean;
    searchForMovie?: boolean;
    minimumAvailability?: 'announced' | 'inCinemas' | 'released' | 'preDB';
}
export interface RadarrClientOptions {
    url: string;
    apiKey: string;
}
export declare class RadarrClient {
    private readonly options?;
    private _http?;
    constructor(options?: RadarrClientOptions | undefined);
    private get http();
    lookup(term: string): Promise<RadarrMovieLookup[]>;
    getMovies(): Promise<RadarrMovie[]>;
    getQualityProfiles(): Promise<RadarrQualityProfile[]>;
    getRootFolders(): Promise<RadarrRootFolder[]>;
    getQueue(): Promise<RadarrQueueItem[]>;
    addMovie(options: AddMovieOptions): Promise<RadarrMovie>;
}
export declare const radarrClient: RadarrClient;
export {};
