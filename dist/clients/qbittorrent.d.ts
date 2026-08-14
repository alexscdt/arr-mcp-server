import { z } from 'zod';
declare const qbittorrentTorrentSchema: z.ZodObject<{
    hash: z.ZodString;
    name: z.ZodString;
    size: z.ZodNumber;
    progress: z.ZodNumber;
    dlspeed: z.ZodNumber;
    upspeed: z.ZodNumber;
    eta: z.ZodNumber;
    state: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    save_path: z.ZodOptional<z.ZodString>;
    content_path: z.ZodOptional<z.ZodString>;
    added_on: z.ZodNumber;
    completion_on: z.ZodOptional<z.ZodNumber>;
    num_seeds: z.ZodOptional<z.ZodNumber>;
    num_leechs: z.ZodOptional<z.ZodNumber>;
    ratio: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    size: number;
    hash: string;
    progress: number;
    dlspeed: number;
    upspeed: number;
    eta: number;
    state: string;
    added_on: number;
    category?: string | undefined;
    tags?: string | undefined;
    save_path?: string | undefined;
    content_path?: string | undefined;
    completion_on?: number | undefined;
    num_seeds?: number | undefined;
    num_leechs?: number | undefined;
    ratio?: number | undefined;
}, {
    name: string;
    size: number;
    hash: string;
    progress: number;
    dlspeed: number;
    upspeed: number;
    eta: number;
    state: string;
    added_on: number;
    category?: string | undefined;
    tags?: string | undefined;
    save_path?: string | undefined;
    content_path?: string | undefined;
    completion_on?: number | undefined;
    num_seeds?: number | undefined;
    num_leechs?: number | undefined;
    ratio?: number | undefined;
}>;
export type QbittorrentTorrent = z.infer<typeof qbittorrentTorrentSchema>;
export interface QbittorrentClientOptions {
    url: string;
    username: string;
    password: string;
}
export declare class QbittorrentClient {
    private readonly options?;
    private _http?;
    private cookie;
    private lastAuthAt;
    private readonly authTtlMs;
    constructor(options?: QbittorrentClientOptions | undefined);
    private get creds();
    private get http();
    private ensureAuthenticated;
    getTorrents(filter?: {
        filter?: 'all' | 'downloading' | 'seeding' | 'completed' | 'paused' | 'active' | 'inactive';
        category?: string;
    }): Promise<QbittorrentTorrent[]>;
}
export declare const qbittorrentClient: QbittorrentClient;
export {};
