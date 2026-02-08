import type { AutoEQEntry } from '../../types/autoeq'

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

/** Parsed bundle: index entries + lookup map for ParametricEQ text by path */
interface ParsedBundle {
  entries: AutoEQEntry[]
  profileMap: Map<string, string>
}

let cachedBundle: ParsedBundle | null = null

/**
 * Load and parse the AutoEQ bundle from the Electron main process.
 * Returns null when running in the web version (no electronAPI).
 */
async function loadBundle(): Promise<ParsedBundle | null> {
  if (cachedBundle) return cachedBundle

  const api = window.electronAPI
  if (!api?.isElectron) return null

  try {
    const raw = await api.getAutoEQBundle()
    if (!raw) return null

    const bundle: Bundle = JSON.parse(raw)
    const entries: AutoEQEntry[] = []
    const profileMap = new Map<string, string>()

    for (const e of bundle.entries) {
      entries.push({ name: e.name, source: e.source, form: e.form, path: e.path })
      profileMap.set(e.path, e.parametricEQ)
    }

    cachedBundle = { entries, profileMap }
    return cachedBundle
  } catch {
    return null
  }
}

/** Get all AutoEQ entries from the offline bundle. Returns null if unavailable. */
export async function getBundleEntries(): Promise<AutoEQEntry[] | null> {
  const bundle = await loadBundle()
  return bundle?.entries ?? null
}

/** Look up a ParametricEQ.txt from the offline bundle by entry path. Returns null if not found. */
export async function getBundleProfile(path: string): Promise<string | null> {
  const bundle = await loadBundle()
  return bundle?.profileMap.get(path) ?? null
}
