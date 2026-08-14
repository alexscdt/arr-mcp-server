import { describe, expect, it } from 'vitest'
import { formatBytes, formatEta, formatSpeed } from '../../src/tools/list_downloads.js'

describe('formatBytes', () => {
    it('handles zero', () => {
        expect(formatBytes(0)).toBe('0 B')
    })

    it('formats kilobytes and gigabytes', () => {
        expect(formatBytes(1536)).toBe('1.5 KB')
        expect(formatBytes(1073741824)).toBe('1.0 GB')
    })
})

describe('formatSpeed', () => {
    it('handles zero and formats per-second rates', () => {
        expect(formatSpeed(0)).toBe('0 B/s')
        expect(formatSpeed(1048576)).toBe('1.0 MB/s')
    })
})

describe('formatEta', () => {
    it('treats the qBittorrent 8640000 sentinel and negatives as infinite', () => {
        expect(formatEta(8640000)).toBe('∞')
        expect(formatEta(-1)).toBe('∞')
    })

    it('formats seconds, minutes and hours', () => {
        expect(formatEta(45)).toBe('45s')
        expect(formatEta(120)).toBe('2 min')
        expect(formatEta(5400)).toBe('1h 30min')
    })
})
