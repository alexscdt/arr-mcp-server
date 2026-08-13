import { config as loadEnv } from 'dotenv'
import { z } from 'zod'

loadEnv()

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

function loadConfig(): Config {
    const rawConfig: RawConfig = {
        radarr: {
            url: process.env.RADARR_URL,
            apiKey: process.env.RADARR_API_KEY
        },
        sonarr: {
            url: process.env.SONARR_URL,
            apiKey: process.env.SONARR_API_KEY
        },
        qbittorrent: {
            url: process.env.QBITTORRENT_URL,
            username: process.env.QBITTORRENT_USERNAME,
            password: process.env.QBITTORRENT_PASSWORD
        },
        plex: {
            url: process.env.PLEX_URL,
            token: process.env.PLEX_TOKEN
        },
        overseerr: {
            url: process.env.OVERSEERR_URL,
            apiKey: process.env.OVERSEERR_API_KEY
        },
        logLevel: process.env.LOG_LEVEL
    }

    const parsed = configSchema.safeParse(rawConfig)

    if (!parsed.success) {
        console.error('Invalid configuration:')
        console.error(JSON.stringify(parsed.error.format(), null, 2))
        process.exit(1)
    }

    return parsed.data
}

export const config: Config = loadConfig()