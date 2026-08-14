import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleAddMovie } from '../../src/tools/add_movie.js'
import { radarrClient } from '../../src/clients/radarr.js'

const matrixLookup = { tmdbId: 603, title: 'The Matrix', year: 1999 }
const qualityProfiles = [
    { id: 1, name: 'HD-1080p' },
    { id: 2, name: 'Ultra-HD' }
]
const rootFolders = [{ id: 1, path: '/movies' }]
const addedMovie = {
    id: 10,
    title: 'The Matrix',
    year: 1999,
    tmdbId: 603,
    hasFile: false,
    monitored: true,
    status: 'announced'
}

describe('handleAddMovie', () => {
    beforeEach(() => {
        vi.spyOn(radarrClient, 'getMovies').mockResolvedValue([])
        vi.spyOn(radarrClient, 'lookup').mockResolvedValue([matrixLookup])
        vi.spyOn(radarrClient, 'getQualityProfiles').mockResolvedValue(qualityProfiles)
        vi.spyOn(radarrClient, 'getRootFolders').mockResolvedValue(rootFolders)
        vi.spyOn(radarrClient, 'addMovie').mockResolvedValue(addedMovie)
    })

    it('does not re-add a movie already in Radarr', async () => {
        vi.spyOn(radarrClient, 'getMovies').mockResolvedValue([
            { ...addedMovie, hasFile: true, status: 'released' }
        ])

        const result = await handleAddMovie({ tmdbId: 603 })

        expect(result).toContain('already in Radarr')
        expect(radarrClient.addMovie).not.toHaveBeenCalled()
    })

    it('selects the quality profile case-insensitively', async () => {
        await handleAddMovie({ tmdbId: 603, qualityProfileName: 'ultra-hd' })

        expect(radarrClient.addMovie).toHaveBeenCalledWith(
            expect.objectContaining({ qualityProfileId: 2 })
        )
    })

    it('lists available profiles when the requested one does not exist', async () => {
        const result = await handleAddMovie({ tmdbId: 603, qualityProfileName: 'nonexistent' })

        expect(result).toContain('not found')
        expect(result).toContain('HD-1080p, Ultra-HD')
        expect(radarrClient.addMovie).not.toHaveBeenCalled()
    })

    it('adds the movie with the first root folder and triggers a search by default', async () => {
        const result = await handleAddMovie({ tmdbId: 603 })

        expect(radarrClient.addMovie).toHaveBeenCalledWith(
            expect.objectContaining({
                tmdbId: 603,
                title: 'The Matrix',
                year: 1999,
                qualityProfileId: 1,
                rootFolderPath: '/movies',
                searchForMovie: true
            })
        )
        expect(result).toContain('Added "The Matrix" (1999)')
        expect(result).toContain('Search for a release has been triggered')
    })
})
