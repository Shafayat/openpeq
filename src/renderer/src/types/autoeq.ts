export interface AutoEQEntry {
  /** Headphone name, e.g. "HIFIMAN Edition XS" */
  name: string;
  /** Measurement source, e.g. "oratory1990" */
  source: string;
  /** Form factor, e.g. "over-ear", "in-ear" */
  form: string;
  /** Relative path under results/, e.g. "oratory1990/over-ear/HIFIMAN Edition XS" */
  path: string;
}

export interface AutoEQIndex {
  entries: AutoEQEntry[];
  fetchedAt: number;
}
