import type { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const listDownloadsToolDefinition: Tool;
export declare function formatBytes(bytes: number): string;
export declare function formatSpeed(bytesPerSecond: number): string;
export declare function formatEta(seconds: number): string;
export declare function handleListDownloads(args: unknown): Promise<string>;
