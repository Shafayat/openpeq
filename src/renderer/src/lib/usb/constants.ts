/** Walkplay vendor IDs that cover Protocol Max and related devices */
export const WALKPLAY_VENDOR_IDS = [
  0x3302, 0x0762, 0x35d8, 0x2fc6, 0x0104, 0xb445, 0x0661, 0x0666, 0x0d8c,
];

export const REPORT_ID = 0x4b;

export const READ = 0x80;
export const WRITE = 0x01;
export const END = 0x00;

export const CMD = {
  PEQ_VALUES: 0x09,
  VERSION: 0x0c,
  TEMP_WRITE: 0x0a,
  FLASH_EQ: 0x01,
  GET_SLOT: 0x0f,
  GLOBAL_GAIN: 0x03,
} as const;

export const FILTER_TYPE_TO_BYTE: Record<string, number> = {
  LSQ: 1,
  PK: 2,
  HSQ: 3,
};

export const BYTE_TO_FILTER_TYPE: Record<number, string> = {
  1: 'LSQ',
  2: 'PK',
  3: 'HSQ',
};

export const PROTOCOL_MAX_CONFIG = {
  maxFilters: 10,
  minGain: -10,
  maxGain: 10,
  autoGlobalGain: true,
  supportsLSHSFilters: true,
  supportsPregain: true,
  schemeNo: 16,
} as const;
