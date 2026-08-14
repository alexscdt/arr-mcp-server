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
})
