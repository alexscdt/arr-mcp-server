import { z } from 'zod'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { sonarrClient } from '../clients/sonarr.js'

export const addSeriesToolDefinition: Tool = {
    name: 'add_series',
    description:
        'Add a TV series to Sonarr and trigger a search for missing episodes. Requires a tvdbId (get it from search_series first). By default monitors all seasons.',
    inputSchema: {
        type: 'object',
        properties: {
            tvdbId: {
                type: 'number',
                description: 'TVDB id of the series (obtained from search_series)'
            },
            qualityProfileName: {
                type: 'string',
                description:
                    'Optional quality profile name (e.g. "HD-1080p", "Any"). Falls back to the first profile if not specified.'
            },
            monitor: {
                type: 'string',
                enum: ['all', 'future', 'missing', 'existing', 'firstSeason', 'latestSeason', 'none'],
                description:
                    'What to monitor: all seasons (default), only future episodes, only missing, etc.'
            },
            searchNow: {
                type: 'boolean',
                description: 'Whether to trigger a search for missing episodes immediately (default: true)'
            }
        },
        required: ['tvdbId']
    }
}

const addSeriesInputSchema = z.object({
    tvdbId: z.number().int().positive(),
    qualityProfileName: z.string().optional(),
    monitor: z
        .enum(['all', 'future', 'missing', 'existing', 'firstSeason', 'latestSeason', 'none'])
        .default('all'),
    searchNow: z.boolean().default(true)
})

type AddSeriesInput = z.infer<typeof addSeriesInputSchema>

export async function handleAddSeries(args: unknown): Promise<string> {
    const input: AddSeriesInput = addSeriesInputSchema.parse(args)

    const existingSeries = await sonarrClient.getSeries()
    const alreadyAdded = existingSeries.find((series) => series.tvdbId === input.tvdbId)

    if (alreadyAdded) {
        const episodeInfo = alreadyAdded.statistics
            ? ` (${alreadyAdded.statistics.episodeFileCount ?? 0}/${alreadyAdded.statistics.episodeCount ?? 0} episodes downloaded)`
            : ''
        return `Series "${alreadyAdded.title}" is already in Sonarr${episodeInfo}.`
    }

    const [lookupResults, qualityProfiles, languageProfiles, rootFolders] = await Promise.all([
        sonarrClient.lookup(`tvdb:${input.tvdbId}`),
        sonarrClient.getQualityProfiles(),
        sonarrClient.getLanguageProfiles().catch(() => []),
        sonarrClient.getRootFolders()
    ])

    const seriesInfo = lookupResults.find((series) => series.tvdbId === input.tvdbId)
    if (!seriesInfo) {
        return `No series found on TVDB with id ${input.tvdbId}. Use search_series to find valid tvdbIds.`
    }

    if (qualityProfiles.length === 0) {
        return 'No quality profiles configured in Sonarr. Please create one first.'
    }

    if (rootFolders.length === 0) {
        return 'No root folders configured in Sonarr. Please add one first.'
    }

    const selectedProfile = input.qualityProfileName
        ? qualityProfiles.find(
            (profile) => profile.name.toLowerCase() === input.qualityProfileName?.toLowerCase()
        )
        : qualityProfiles[0]

    if (!selectedProfile) {
        const availableNames = qualityProfiles.map((profile) => profile.name).join(', ')
        return `Quality profile "${input.qualityProfileName}" not found. Available profiles: ${availableNames}`
    }

    const rootFolder = rootFolders[0]
    if (!rootFolder) {
        return 'No root folders available.'
    }

    const languageProfile = languageProfiles[0]

    const added = await sonarrClient.addSeries({
        tvdbId: input.tvdbId,
        title: seriesInfo.title,
        qualityProfileId: selectedProfile.id,
        languageProfileId: languageProfile?.id,
        rootFolderPath: rootFolder.path,
        monitor: input.monitor,
        searchForMissingEpisodes: input.searchNow
    })

    const searchNote = input.searchNow
        ? ' Search for missing episodes has been triggered — downloads should start shortly if matches are found.'
        : ' No search was triggered (searchNow=false).'

    return `Added "${added.title}" to Sonarr using profile "${selectedProfile.name}", folder "${rootFolder.path}", monitoring: ${input.monitor}.${searchNote}`
}