import { z } from 'zod'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { sonarrClient } from '../clients/sonarr.js'

export const searchSeriesToolDefinition: Tool = {
    name: 'search_series',
    description:
        'Search for a TV series by title. Returns a list of matching series with metadata (title, year, TVDB id, overview, network, status). Use this before add_series to find the exact tvdbId.',
    inputSchema: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Series title to search for (e.g. "Severance", "Breaking Bad")'
            },
            limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 5, max: 20)',
                minimum: 1,
                maximum: 20
            }
        },
        required: ['query']
    }
}

const searchSeriesInputSchema = z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(20).default(5)
})

type SearchSeriesInput = z.infer<typeof searchSeriesInputSchema>

export async function handleSearchSeries(args: unknown): Promise<string> {
    const input: SearchSeriesInput = searchSeriesInputSchema.parse(args)

    const results = await sonarrClient.lookup(input.query)
    const limited = results.slice(0, input.limit)

    if (limited.length === 0) {
        return `No series found matching "${input.query}".`
    }

    const formatted = limited.map((series, index) => {
        const year = series.year ? ` (${series.year})` : ''
        const rating = series.ratings?.value ? ` (Rating: ${series.ratings.value.toFixed(1)}/10)` : ''
        const network = series.network ? ` — ${series.network}` : ''
        const status = series.status ? ` [${series.status}]` : ''
        const genres = series.genres && series.genres.length > 0 ? ` [${series.genres.join(', ')}]` : ''
        const seasons = series.seasons ? ` — ${series.seasons.length} season(s)` : ''
        const overview = series.overview
            ? `\n   ${series.overview.slice(0, 200)}${series.overview.length > 200 ? '…' : ''}`
            : ''

        return `${index + 1}. ${series.title}${year} — tvdbId: ${series.tvdbId}${rating}${network}${status}${genres}${seasons}${overview}`
    })

    return `Found ${limited.length} series matching "${input.query}":\n\n${formatted.join('\n\n')}`
}