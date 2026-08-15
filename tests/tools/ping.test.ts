import { describe, expect, it } from 'vitest'
import { handlePing } from '../../src/tools/ping.js'

describe('handlePing', () => {
    it('echoes the provided message', async () => {
        const result = await handlePing({ message: 'hello there' })
        expect(result).toContain('pong! hello there')
    })

    it('falls back to a default message when none is given', async () => {
        const result = await handlePing({})
        expect(result).toContain('pong! Server is alive.')
    })

    it('includes an ISO timestamp in the response', async () => {
        const result = await handlePing({})
        expect(result).toMatch(/\(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\)/)
    })

    it('rejects a non-string message', async () => {
        await expect(handlePing({ message: 42 })).rejects.toThrow()
    })
})
