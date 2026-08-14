import { readFileSync, writeFileSync, chmodSync } from 'node:fs'

const entryPoint = 'dist/index.js'
const shebang = '#!/usr/bin/env node\n'

const content = readFileSync(entryPoint, 'utf8')

if (!content.startsWith('#!')) {
    writeFileSync(entryPoint, shebang + content)
    console.log(`Added shebang to ${entryPoint}`)
}

chmodSync(entryPoint, 0o755)
console.log(`Made ${entryPoint} executable`)