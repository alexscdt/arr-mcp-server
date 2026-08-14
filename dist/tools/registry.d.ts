import type { Tool } from '@modelcontextprotocol/sdk/types.js';
export interface RegisteredTool {
    definition: Tool;
    handler: (args: unknown) => Promise<string>;
}
export declare const toolRegistry: RegisteredTool[];
