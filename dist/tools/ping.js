import { z } from 'zod';
export const pingToolDefinition = {
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
};
const pingInputSchema = z.object({
    message: z.string().optional()
});
export async function handlePing(args) {
    const input = pingInputSchema.parse(args);
    const timestamp = new Date().toISOString();
    return `pong! ${input.message ?? 'Server is alive.'} (${timestamp})`;
}
//# sourceMappingURL=ping.js.map