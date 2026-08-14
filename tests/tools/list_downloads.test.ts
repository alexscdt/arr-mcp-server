import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleListDownloads } from '../../src/tools/list_downloads.js'
import { qbittorrentClient, type QbittorrentTorrent } from '../../src/clients/qbittorrent.js'
import { radarrClient } from '../../src/clients/radarr.js'
import { sonarrClient } from '../../src/clients/sonarr.js'

function torrent(overrides: Partial<QbittorrentTorrent>): QbittorrentTorrent {
    return {
        hash: 'abc123',
        name: 'Some.Movie.2024.1080p',
        size: 1000,
        progress: 1,
        dlspeed: 0,
        upspeed: 0,
        eta: 0,
        state: 'uploading',
        added_on: 1700000000,
        ...overrides
    }
}

describe('handleListDownloads', () => {
    beforeEach(() => {
        vi.spyOn(radarrClient, 'getQueue').mockResolvedValue([])
        vi.spyOn(sonarrClient, 'getQueue').mockResolvedValue([])
    })

    it('counts actively uploading and passive UP states as seeding', async () => {
        vi.spyOn(qbittorrentClient, 'getTorrents').mockResolvedValue([
            torrent({ hash: 'a', state: 'uploading' }),
            torrent({ hash: 'b', state: 'stalledUP' }),
            torrent({ hash: 'c', state: 'downloading', progress: 0.4 })
        ])

        const result = await handleListDownloads({ includeCompleted: true })

        expect(result).toContain('En seeding: 2 torrents')
    })

    it('reports a quiet state when nothing is downloading', async () => {
        vi.spyOn(qbittorrentClient, 'getTorrents').mockResolvedValue([])

        const result = await handleListDownloads({})

        expect(result).toContain('No active downloads')
    })
})
