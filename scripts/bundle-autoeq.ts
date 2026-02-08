/**
 * Build-time script: downloads all AutoEQ ParametricEQ profiles from GitHub
 * and bundles them into a single JSON file for offline Electron use.
 *
 * Usage: npm run bundle-autoeq
 */
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const INDEX_URL = 'https://raw.githubusercontent.com/jaakkopasanen/AutoEq/master/results/INDEX.md'
const RAW_BASE = 'https://raw.githubusercontent.com/jaakkopasanen/AutoEq/master/results'
const OUT_PATH = path.join(__dirname, '../resources/autoeq-bundle.json')
const CONCURRENCY = 20

interface BundleEntry {
  name: string
  source: string
  form: string
  path: string
  parametricEQ: string
}

interface Bundle {
  version: string
  generatedAt: string
  entries: BundleEntry[]
}

function parseIndexMd(markdown: string): { name: string; source: string; form: string; path: string }[] {
  const entries: { name: string; source: string; form: string; path: string }[] = []
  const lineRegex = /^- \[(.+?)\]\(\.\/(.+?)\)\s+by\s+(.+?)$/

  for (const line of markdown.split('\n')) {
    const match = line.trim().match(lineRegex)
    if (!match) continue

    const name = match[1]
    const rawPath = decodeURIComponent(match[2])
    if (rawPath.includes('..')) continue

    const sourceAndRig = match[3]
    const source = sourceAndRig.replace(/\s+on\s+.+$/, '')

    const pathParts = rawPath.split('/')
    let form = 'unknown'
    if (pathParts.length >= 2) {
      const formSegment = pathParts[1]
      if (formSegment.includes('over-ear')) form = 'over-ear'
      else if (formSegment.includes('in-ear')) form = 'in-ear'
      else if (formSegment.includes('earbud')) form = 'earbud'
      else form = formSegment
    }

    entries.push({ name, source, form, path: rawPath })
  }

  return entries
}

async function fetchWithRetry(url: string, retries = 2): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (res.ok) return await res.text()
      if (res.status === 404) return null
      // Retry on server errors
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
    } catch {
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  return null
}

async function runPool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  let index = 0

  async function worker() {
    while (index < items.length) {
      const i = index++
      results[i] = await fn(items[i])
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return results
}

async function main() {
  console.log('Fetching AutoEQ index...')
  const indexRes = await fetch(INDEX_URL)
  if (!indexRes.ok) {
    throw new Error(`Failed to fetch INDEX.md: ${indexRes.status}`)
  }
  const indexMd = await indexRes.text()
  const entries = parseIndexMd(indexMd)
  console.log(`Found ${entries.length} entries`)

  let completed = 0
  let skipped = 0

  const bundleEntries: (BundleEntry | null)[] = await runPool(entries, CONCURRENCY, async (entry) => {
    const encodedPath = entry.path
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/')
    const encodedFilename = encodeURIComponent(`${entry.name} ParametricEQ.txt`)
    const url = `${RAW_BASE}/${encodedPath}/${encodedFilename}`

    const text = await fetchWithRetry(url)
    completed++

    if (completed % 100 === 0) {
      console.log(`  ${completed}/${entries.length} (${skipped} skipped)`)
    }

    if (!text) {
      skipped++
      return null
    }

    return {
      name: entry.name,
      source: entry.source,
      form: entry.form,
      path: entry.path,
      parametricEQ: text,
    }
  })

  const validEntries = bundleEntries.filter((e): e is BundleEntry => e !== null)

  console.log(`\nDone: ${validEntries.length} profiles bundled, ${skipped} skipped`)

  const bundle: Bundle = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    entries: validEntries,
  }

  mkdirSync(path.dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, JSON.stringify(bundle))

  const sizeMB = (Buffer.byteLength(JSON.stringify(bundle)) / 1024 / 1024).toFixed(1)
  console.log(`Written to ${OUT_PATH} (${sizeMB} MB)`)
}

main().catch(err => {
  console.error('Bundle failed:', err)
  process.exit(1)
})
