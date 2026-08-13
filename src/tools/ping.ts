import { z } from 'zod'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'

export const pingToolDefinition: Tool = {
    name: 'ping',
    description: 'Simple ping tool to verify the MCP server is responding',
    inputSchema: {
        type: 'object',
        properties: {
            message: {
                type: 'string',
                description: 'Optional message to echo back'
            }
        }
    }
}

const pingInputSchema = z.object({
    message: z.string().optional()
})

type PingInput = z.infer<typeof pingInputSchema>

export async function handlePing(args: unknown): Promise<string> {
    const input: PingInput = pingInputSchema.parse(args)
    const timestamp: string = new Date().toISOString()
    return `pong! ${input.message ?? 'Server is alive.'} (${timestamp})`
}