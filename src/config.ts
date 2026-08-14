import { config as loadEnv } from 'dotenv'
import { z } from 'zod'

const configSchema = z.object({
    radarr: z.object({
        url: z.string().url(),
        apiKey: z.string().min(1)
    }),
    sonarr: z.object({
        url: z.string().url(),
        apiKey: z.string().min(1)
    }),
    qbittorrent: z.object({
        url: z.string().url(),
        username: z.string().min(1),
        password: z.string().min(1)
    }),
    plex: z.object({
        url: z.string().url(),
        token: z.string().min(1)
    }),
    overseerr: z.object({
        url: z.string().url(),
        apiKey: z.string().min(1)
    }),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info')
})

export type Config = z.infer<typeof configSchema>

export class ConfigError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ConfigError'
    }
}

type RawConfig = {
    radarr: { url: string | undefined; apiKey: string | undefined }
    sonarr: { url: string | undefined; apiKey: string | undefined }
    qbittorrent: {
        url: string | undefined
        username: string | undefined
        password: string | undefined
    }
    plex: { url: string | undefined; token: string | undefined }
    overseerr: { url: string | undefined; apiKey: string | undefined }
    logLevel: string | undefined
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
    const rawConfig: RawConfig = {
        radarr: {
            url: env.RADARR_URL,
            apiKey: env.RADARR_API_KEY
        },
        sonarr: {
            url: env.SONARR_URL,
            apiKey: env.SONARR_API_KEY
        },
        qbittorrent: {
            url: env.QBITTORRENT_URL,
            username: env.QBITTORRENT_USERNAME,
            password: env.QBITTORRENT_PASSWORD
        },
        plex: {
            url: env.PLEX_URL,
            token: env.PLEX_TOKEN
        },
        overseerr: {
            url: env.OVERSEERR_URL,
            apiKey: env.OVERSEERR_API_KEY
        },
        logLevel: env.LOG_LEVEL
    }

    const parsed = configSchema.safeParse(rawConfig)

    if (!parsed.success) {
        throw new ConfigError(JSON.stringify(parsed.error.format(), null, 2))
    }

    return parsed.data
}

let cachedConfig: Config | undefined

export function getConfig(): Config {
    if (!cachedConfig) {
        loadEnv()
        cachedConfig = loadConfig()
    }
    return cachedConfig
}
