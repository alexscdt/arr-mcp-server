import { describe, expect, it } from 'vitest'
import { toolRegistry } from '../../src/tools/registry.js'

describe('toolRegistry', () => {
    it('exposes the 7 tools with unique names', () => {
        expect(toolRegistry).toHaveLength(7)

        const names = toolRegistry.map((tool) => tool.definition.name)
        expect(new Set(names).size).toBe(names.length)
    })

    it('gives every tool a description, an object input schema and a handler', () => {
        for (const tool of toolRegistry) {
            expect(tool.definition.description).toBeTruthy()
            expect(tool.definition.inputSchema.type).toBe('object')
            expect(typeof tool.handler).toBe('function')
        }
    })
})
