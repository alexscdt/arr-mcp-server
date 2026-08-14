#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    type CallToolResult,
    type ListToolsResult
} from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import { getConfig, ConfigError, type Config } from './config.js'
import { toolRegistry } from './tools/registry.js'

const packageJsonSchema = z.object({
    name: z.string().min(1),
    version: z.string().min(1)
})

type PackageInfo = z.infer<typeof packageJsonSchema>

function loadPackageInfo(): PackageInfo {
    const currentDir: string = dirname(fileURLToPath(import.meta.url))
    const raw: string = readFileSync(resolve(currentDir, '../package.json'), 'utf-8')
    return packageJsonSchema.parse(JSON.parse(raw))
}

const pkg: {name: string; version: string} = loadPackageInfo()

const server = new Server(
    {
        name: pkg.name,
        version: pkg.version
    },
    {
        capabilities: {
            tools: {}
        }
    }
)

server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => ({
    tools: toolRegistry.map((tool) => tool.definition)
}))

server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const { name, arguments: args } = request.params

    const tool = toolRegistry.find((entry) => entry.definition.name === name)
    if (!tool) {
        return {
            content: [{ type: 'text', text: `Unknown tool: ${name}` }],
            isError: true
        }
    }

    try {
        const result: string = await tool.handler(args)
        return {
            content: [{ type: 'text', text: result }]
        }
    } catch (error) {
        const message: string = error instanceof Error ? error.message : String(error)
        return {
            content: [{ type: 'text', text: `Error executing ${name}: ${message}` }],
            isError: true
        }
    }
})

async function main(): Promise<void> {
    let config: Config
    try {
        config = getConfig()
    } catch (error) {
        if (error instanceof ConfigError) {
            console.error('Invalid configuration:')
            console.error(error.message)
            process.exit(1)
        }
        throw error
    }

    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error(`${pkg.name} v${pkg.version} started (log level: ${config.logLevel})`)
}

main().catch((error: unknown): never => {
    console.error('Fatal error:', error)
    process.exit(1)
})
