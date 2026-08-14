import { z } from 'zod';
declare const configSchema: z.ZodObject<{
    radarr: z.ZodObject<{
        url: z.ZodString;
        apiKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        apiKey: string;
    }, {
        url: string;
        apiKey: string;
    }>;
    sonarr: z.ZodObject<{
        url: z.ZodString;
        apiKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        apiKey: string;
    }, {
        url: string;
        apiKey: string;
    }>;
    qbittorrent: z.ZodObject<{
        url: z.ZodString;
        username: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        username: string;
        password: string;
    }, {
        url: string;
        username: string;
        password: string;
    }>;
    plex: z.ZodObject<{
        url: z.ZodString;
        token: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        token: string;
    }, {
        url: string;
        token: string;
    }>;
    overseerr: z.ZodObject<{
        url: z.ZodString;
        apiKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        apiKey: string;
    }, {
        url: string;
        apiKey: string;
    }>;
    logLevel: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
}, "strip", z.ZodTypeAny, {
    radarr: {
        url: string;
        apiKey: string;
    };
    sonarr: {
        url: string;
        apiKey: string;
    };
    qbittorrent: {
        url: string;
        username: string;
        password: string;
    };
    plex: {
        url: string;
        token: string;
    };
    overseerr: {
        url: string;
        apiKey: string;
    };
    logLevel: "debug" | "info" | "warn" | "error";
}, {
    radarr: {
        url: string;
        apiKey: string;
    };
    sonarr: {
        url: string;
        apiKey: string;
    };
    qbittorrent: {
        url: string;
        username: string;
        password: string;
    };
    plex: {
        url: string;
        token: string;
    };
    overseerr: {
        url: string;
        apiKey: string;
    };
    logLevel?: "debug" | "info" | "warn" | "error" | undefined;
}>;
export type Config = z.infer<typeof configSchema>;
export declare class ConfigError extends Error {
    constructor(message: string);
}
export declare function loadConfig(env?: NodeJS.ProcessEnv): Config;
export declare function getConfig(): Config;
export {};
