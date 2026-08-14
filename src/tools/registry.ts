import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { handlePing, pingToolDefinition } from './ping.js'
import { handleSearchMovie, searchMovieToolDefinition } from './search_movie.js'
import { handleAddMovie, addMovieToolDefinition } from './add_movie.js'
import { handleSearchSeries, searchSeriesToolDefinition } from './search_series.js'
import { handleAddSeries, addSeriesToolDefinition } from './add_series.js'
import { handleListDownloads, listDownloadsToolDefinition } from './list_downloads.js'
import { handleGetLibrary, getLibraryToolDefinition } from './get_library.js'

export interface RegisteredTool {
    definition: Tool
    handler: (args: unknown) => Promise<string>
}

export const toolRegistry: RegisteredTool[] = [
    { definition: pingToolDefinition, handler: handlePing },
    { definition: searchMovieToolDefinition, handler: handleSearchMovie },
    { definition: addMovieToolDefinition, handler: handleAddMovie },
    { definition: searchSeriesToolDefinition, handler: handleSearchSeries },
    { definition: addSeriesToolDefinition, handler: handleAddSeries },
    { definition: listDownloadsToolDefinition, handler: handleListDownloads },
    { definition: getLibraryToolDefinition, handler: handleGetLibrary }
]
