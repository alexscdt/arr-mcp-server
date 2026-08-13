import { z } from 'zod'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { radarrClient } from '../clients/radarr.js'

export const searchMovieToolDefinition: Tool = {
    name: 'search_movie',
    description:
        'Search for a movie by title. Returns a list of matching movies with metadata (title, year, TMDB id, overview, ratings). Use this before add_movie to find the exact tmdbId.',
    inputSchema: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Movie title to search for (e.g. "Anora", "Inception")'
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

const searchMovieInputSchema = z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(20).default(5)
})

type SearchMovieInput = z.infer<typeof searchMovieInputSchema>

export async function handleSearchMovie(args: unknown): Promise<string> {
    const input: SearchMovieInput = searchMovieInputSchema.parse(args)

    const results = await radarrClient.lookup(input.query)
    const limited = results.slice(0, input.limit)

    if (limited.length === 0) {
        return `No movies found matching "${input.query}".`
    }

    const formatted = limited.map((movie, index) => {
        const tmdbRating = movie.ratings?.tmdb?.value
        const rating = tmdbRating ? ` (TMDB: ${tmdbRating.toFixed(1)}/10)` : ''
        const runtime = movie.runtime ? ` — ${movie.runtime} min` : ''
        const genres = movie.genres && movie.genres.length > 0 ? ` [${movie.genres.join(', ')}]` : ''
        const overview = movie.overview ? `\n   ${movie.overview.slice(0, 200)}${movie.overview.length > 200 ? '…' : ''}` : ''

        return `${index + 1}. ${movie.title} (${movie.year}) — tmdbId: ${movie.tmdbId}${rating}${runtime}${genres}${overview}`
    })

    return `Found ${limited.length} movie(s) matching "${input.query}":\n\n${formatted.join('\n\n')}`
}