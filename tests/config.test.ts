import { describe, expect, it } from 'vitest'
import { ConfigError, loadConfig } from '../src/config.js'

const validEnv: NodeJS.ProcessEnv = {
    RADARR_URL: 'http://localhost:7878',
    RADARR_API_KEY: 'radarr-key',
    SONARR_URL: 'http://localhost:8989',
    SONARR_API_KEY: 'sonarr-key',
    QBITTORRENT_URL: 'http://localhost:8080',
    QBITTORRENT_USERNAME: 'admin',
    QBITTORRENT_PASSWORD: 'adminadmin',
    PLEX_URL: 'http://localhost:32400',
    PLEX_TOKEN: 'plex-token',
    OVERSEERR_URL: 'http://localhost:5055',
    OVERSEERR_API_KEY: 'overseerr-key'
}

describe('loadConfig', () => {
    it('parses a valid environment and defaults logLevel to info', () => {
        const config = loadConfig(validEnv)

        expect(config.radarr).toEqual({ url: 'http://localhost:7878', apiKey: 'radarr-key' })
        expect(config.qbittorrent.username).toBe('admin')
        expect(config.logLevel).toBe('info')
    })

    it('throws ConfigError when a required variable is missing', () => {
        const { RADARR_API_KEY: _omitted, ...env } = validEnv

        expect(() => loadConfig(env)).toThrow(ConfigError)
    })

    it('throws ConfigError on a malformed URL', () => {
        expect(() => loadConfig({ ...validEnv, PLEX_URL: 'not-a-url' })).toThrow(ConfigError)
    })

    it('throws ConfigError on an empty API key', () => {
        expect(() => loadConfig({ ...validEnv, SONARR_API_KEY: '' })).toThrow(ConfigError)
    })

    it('accepts an explicit valid LOG_LEVEL', () => {
        const config = loadConfig({ ...validEnv, LOG_LEVEL: 'debug' })

        expect(config.logLevel).toBe('debug')
    })

    it('throws ConfigError on an invalid LOG_LEVEL', () => {
        expect(() => loadConfig({ ...validEnv, LOG_LEVEL: 'verbose' })).toThrow(ConfigError)
    })

    it('parses without any Overseerr variables (optional service)', () => {
        const { OVERSEERR_URL: _url, OVERSEERR_API_KEY: _key, ...env } = validEnv

        const config = loadConfig(env)

        expect(config.overseerr).toBeUndefined()
        expect(config.radarr.url).toBe('http://localhost:7878')
    })

    it('throws ConfigError when Overseerr is only half-configured', () => {
        const { OVERSEERR_API_KEY: _key, ...env } = validEnv

        expect(() => loadConfig(env)).toThrow(ConfigError)
    })
})
