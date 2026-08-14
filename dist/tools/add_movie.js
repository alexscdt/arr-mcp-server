import { z } from 'zod';
import { radarrClient } from '../clients/radarr.js';
export const addMovieToolDefinition = {
    name: 'add_movie',
    description: 'Add a movie to Radarr and trigger a search for a download. Requires a tmdbId (get it from search_movie first). By default uses the first available quality profile and root folder.',
    inputSchema: {
        type: 'object',
        properties: {
            tmdbId: {
                type: 'number',
                description: 'TMDB id of the movie (obtained from search_movie)'
            },
            qualityProfileName: {
                type: 'string',
                description: 'Optional quality profile name (e.g. "HD-1080p", "Ultra-HD", "Any"). Falls back to the first profile if not specified.'
            },
            searchNow: {
                type: 'boolean',
                description: 'Whether to trigger a search immediately after adding (default: true)'
            }
        },
        required: ['tmdbId']
    }
};
const addMovieInputSchema = z.object({
    tmdbId: z.number().int().positive(),
    qualityProfileName: z.string().optional(),
    searchNow: z.boolean().default(true)
});
export async function handleAddMovie(args) {
    const input = addMovieInputSchema.parse(args);
    const existingMovies = await radarrClient.getMovies();
    const alreadyAdded = existingMovies.find((movie) => movie.tmdbId === input.tmdbId);
    if (alreadyAdded) {
        const status = alreadyAdded.hasFile ? 'downloaded' : 'monitored (no file yet)';
        return `Movie "${alreadyAdded.title}" (${alreadyAdded.year}) is already in Radarr — status: ${status}.`;
    }
    const [lookupResults, qualityProfiles, rootFolders] = await Promise.all([
        radarrClient.lookup(`tmdb:${input.tmdbId}`),
        radarrClient.getQualityProfiles(),
        radarrClient.getRootFolders()
    ]);
    const movieInfo = lookupResults.find((movie) => movie.tmdbId === input.tmdbId);
    if (!movieInfo) {
        return `No movie found on TMDB with id ${input.tmdbId}. Use search_movie to find valid tmdbIds.`;
    }
    if (qualityProfiles.length === 0) {
        return 'No quality profiles configured in Radarr. Please create one first.';
    }
    if (rootFolders.length === 0) {
        return 'No root folders configured in Radarr. Please add one first.';
    }
    const selectedProfile = input.qualityProfileName
        ? qualityProfiles.find((profile) => profile.name.toLowerCase() === input.qualityProfileName?.toLowerCase())
        : qualityProfiles[0];
    if (!selectedProfile) {
        const availableNames = qualityProfiles.map((profile) => profile.name).join(', ');
        return `Quality profile "${input.qualityProfileName}" not found. Available profiles: ${availableNames}`;
    }
    const rootFolder = rootFolders[0];
    if (!rootFolder) {
        return 'No root folders available.';
    }
    const added = await radarrClient.addMovie({
        tmdbId: input.tmdbId,
        title: movieInfo.title,
        year: movieInfo.year,
        qualityProfileId: selectedProfile.id,
        rootFolderPath: rootFolder.path,
        searchForMovie: input.searchNow
    });
    const searchNote = input.searchNow
        ? ' Search for a release has been triggered — the download should start shortly if a match is found.'
        : ' No search was triggered (searchNow=false).';
    return `Added "${added.title}" (${added.year}) to Radarr using profile "${selectedProfile.name}" and folder "${rootFolder.path}".${searchNote}`;
}
//# sourceMappingURL=add_movie.js.map