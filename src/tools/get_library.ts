import { z } from 'zod'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { plexClient, type PlexMediaItem } from '../clients/plex.js'

export const getLibraryToolDefinition: Tool = {
    name: 'get_library',
    description:
        'Get an overview of the Plex library. Can list all libraries, recently added items, or search for a specific title within Plex.',
    inputSchema: {
        type: 'object',
        properties: {
            mode: {
                type: 'string',
                enum: ['overview', 'recent', 'search'],
                description:
                    'What to fetch: "overview" (list of libraries with counts), "recent" (recently added items), "search" (find a title in Plex).'
            },
            query: {
                type: 'string',
                description: 'Search query — required when mode is "search"'
            },
            limit: {
                type: 'number',
                description: 'Max items to return (default: 10, max: 50)',
                minimum: 1,
                maximum: 50
            }
        }
    }
}

const getLibraryInputSchema = z
    .object({
        mode: z.enum(['overview', 'recent', 'search']).default('overview'),
        query: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(10)
    })
    .refine((data) => data.mode !== 'search' || (data.query && data.query.length > 0), {
        message: 'query is required when mode is "search"'
    })

type GetLibraryInput = z.infer<typeof getLibraryInputSchema>

function formatDuration(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000)
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes === 0 ? `${hours}h` : `${hours}h${remainingMinutes.toString().padStart(2, '0')}`
}

function formatItem(item: PlexMediaItem): string {
    const year = item.year ? ` (${item.year})` : ''
    const duration = item.duration ? ` — ${formatDuration(item.duration)}` : ''
    const rating = item.rating ? ` — ${item.rating.toFixed(1)}/10` : ''

    if (item.type === 'episode') {
        const seriesName = item.grandparentTitle ?? 'Unknown series'
        const season = item.parentTitle ?? ''
        const episodeNum = item.index !== undefined ? `E${String(item.index).padStart(2, '0')}` : ''
        return `  • ${seriesName} — ${season} ${episodeNum} — ${item.title}`
    }

    if (item.type === 'season') {
        return `  • ${item.parentTitle ?? item.title}${year}`
    }

    return `  • ${item.title}${year}${duration}${rating}`
}

async function handleOverview(): Promise<string> {
    const libraries = await plexClient.getLibraries()

    if (libraries.length === 0) {
        return '📚 No libraries configured in Plex.'
    }

    const lines: string[] = ['📚 Plex libraries:\n']

    for (const library of libraries) {
        const { totalSize } = await plexClient.getLibraryContents(library.key, { limit: 0 })
        const icon = library.type === 'movie' ? '🎬' : library.type === 'show' ? '📺' : '📁'
        lines.push(`${icon} ${library.title} (${library.type}) — ${totalSize} items`)
    }

    return lines.join('\n')
}

async function handleRecent(limit: number): Promise<string> {
    const items = await plexClient.getRecentlyAdded(undefined, limit)

    if (items.length === 0) {
        return '📭 No recently added items in Plex.'
    }

    const formatted = items.map(formatItem).join('\n')
    return `🆕 Recently added to Plex (${items.length} items):\n\n${formatted}`
}

async function handleSearch(query: string, limit: number): Promise<string> {
    const items = await plexClient.searchLibrary(query)
    const filtered = items.filter((item) =>
        ['movie', 'show', 'season', 'episode'].includes(item.type)
    )
    const limited = filtered.slice(0, limit)

    if (limited.length === 0) {
        return `🔍 No items found in Plex matching "${query}".`
    }

    const formatted = limited.map(formatItem).join('\n')
    return `🔍 Plex results for "${query}" (${limited.length}):\n\n${formatted}`
}

export async function handleGetLibrary(args: unknown): Promise<string> {
    const input: GetLibraryInput = getLibraryInputSchema.parse(args)

    switch (input.mode) {
        case 'overview':
            return handleOverview()
        case 'recent':
            return handleRecent(input.limit)
        case 'search': {
            if (!input.query) {
                throw new Error('query is required when mode is "search"')
            }
            return handleSearch(input.query, input.limit)
        }
    }
}