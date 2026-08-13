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
import { config } from './config'
import { handlePing, pingToolDefinition } from './tools/ping'

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
    tools: [pingToolDefinition]
}))

server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const { name, arguments: args } = request.params

    try {
        switch (name) {
            case 'ping': {
                const result = await handlePing(args)
                return {
                    content: [{ type: 'text', text: result }]
                }
            }
            default:
                return {
                    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
                    isError: true
                }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return {
            content: [{ type: 'text', text: `Error executing ${name}: ${message}` }],
            isError: true
        }
    }
})

async function main(): Promise<void> {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error(`${pkg.name} v${pkg.version} started (log level: ${config.logLevel})`)
}

main().catch((error: unknown): never => {
    console.error('Fatal error:', error)
    process.exit(1)
})