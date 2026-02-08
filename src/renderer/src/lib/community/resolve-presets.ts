import type { Band, FilterType } from '../../types/eq';
import type { AutoEQEntry } from '../../types/autoeq';

export interface ResolvePreset {
  entry: AutoEQEntry;
  bands: Band[];
  preamp: number;
}

function b(freq: number, gain: number, q: number, type: FilterType = 'PK', enabled = true): Band {
  return { freq, gain, q, type, enabled };
}

/**
 * Curated EQ profiles from Resolve (Andrew Park) at headphones.com.
 * Source: headphones.com EQ Repository thread.
 * These are hardcoded since they are not available in the AutoEQ database.
 */
export const RESOLVE_PRESETS: ResolvePreset[] = [
  // ── Over-ear / Full-size ────────────────────────────────
  {
    entry: { name: 'Sennheiser HD 800S', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 800S' },
    preamp: -8.2,
    bands: [
      b(20, 1.8, 1.4), b(71, 1.0, 1.4), b(82, 6.6, 0.6, 'LSQ'), b(190, -2.1, 0.7),
      b(1075, 3.2, 0.6, 'HSQ'), b(1550, 0.6, 2.7), b(3950, -2.0, 4.0),
      b(4900, 2.7, 2.0), b(6000, -4.8, 0.7, 'HSQ'), b(6250, -6.0, 2.0),
    ],
  },
  {
    entry: { name: 'Focal Clear OG', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Focal Clear OG' },
    preamp: -7.3,
    bands: [
      b(20, 2.4, 1.2), b(82, 5.0, 0.7, 'LSQ'), b(195, -1.4, 0.7), b(600, 1.3, 1.0),
      b(1300, -2.2, 1.8), b(2400, 2.2, 1.4), b(3600, -5.0, 2.0),
      b(5000, 2.8, 0.7, 'HSQ'), b(5050, 8.0, 1.4), b(6000, -6.0, 2.0),
    ],
  },
  {
    entry: { name: 'HIFIMAN Edition XS', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN Edition XS' },
    preamp: -5.7,
    bands: [
      b(20, 3.0, 1.0), b(100, 2.7, 0.7, 'LSQ'), b(155, -1.0, 0.9), b(1000, -1.0, 0.5),
      b(1700, 5.4, 1.2), b(3300, -3.0, 2.4), b(5850, 7.5, 2.0),
      b(6300, -9.5, 2.0), b(9000, -3.0, 0.7, 'HSQ'),
    ],
  },
  {
    entry: { name: 'HIFIMAN Arya Stealth', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN Arya Stealth' },
    preamp: -4.0,
    bands: [
      b(71, 4.2, 0.6, 'LSQ'), b(210, -1.8, 0.7), b(1800, 3.2, 1.4),
      b(4200, -4.0, 0.7, 'HSQ'),
    ],
  },
  {
    entry: { name: 'DCA Aeon X Closed', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/DCA Aeon X Closed' },
    preamp: -4.1,
    bands: [
      b(20, 3.0, 0.5), b(115, -2.0, 1.2), b(185, 2.0, 2.0), b(400, -1.0, 0.6),
      b(1750, -1.5, 2.0), b(2300, 5.5, 1.0), b(3250, -1.7, 2.0),
      b(10000, -5.5, 2.0),
    ],
  },
  {
    entry: { name: 'Truthear Nova', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Truthear Nova' },
    preamp: -0.7,
    bands: [
      b(500, 1.2, 1.0), b(1350, -2.4, 0.8), b(5200, -3.5, 0.7),
      b(15000, -2.0, 2.0),
    ],
  },
  {
    entry: { name: 'Truthear Hexa', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Truthear Hexa' },
    preamp: 0,
    bands: [
      b(175, -2.0, 0.8), b(400, 0.7, 0.5), b(1300, -2.4, 0.9),
      b(2000, -2.0, 0.7, 'HSQ'), b(2300, 2.0, 2.0), b(12000, -3.0, 2.0),
    ],
  },
  {
    entry: { name: 'Sennheiser HD 650', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 650' },
    preamp: -11.5,
    bands: [
      b(20, 5.7, 1.0), b(80, 2.0, 0.7, 'LSQ'), b(110, 4.0, 0.7, 'LSQ'),
      b(120, -2.3, 0.6), b(240, -0.9, 0.7), b(615, 0.5, 1.4),
      b(1350, -0.7, 1.8), b(2150, 0.8, 1.5), b(3333, -1.5, 2.0),
    ],
  },
  {
    entry: { name: 'Audeze LCD-X 2021', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Audeze LCD-X 2021' },
    preamp: -9.4,
    bands: [
      b(20, 3.0, 1.4), b(105, 5.2, 0.8, 'LSQ'), b(750, -0.4, 2.0),
      b(1800, 1.4, 2.0), b(2550, -4.0, 1.4), b(3600, 11.0, 1.0),
      b(4200, 2.2, 0.7, 'HSQ'), b(5600, -2.0, 2.0), b(11250, -4.0, 1.3),
    ],
  },
  {
    entry: { name: 'Audeze LCD-XC 2021', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Audeze LCD-XC 2021' },
    preamp: -8.0,
    bands: [
      b(20, 5.0, 1.0), b(100, 3.0, 0.7, 'LSQ'), b(415, 1.6, 2.0),
      b(1050, 1.4, 2.0), b(1600, -3.0, 1.0), b(4550, 6.0, 2.0),
      b(5850, -5.5, 2.0), b(6700, 3.4, 2.0), b(9000, -2.0, 2.0),
      b(12700, -4.3, 2.0),
    ],
  },
  {
    entry: { name: 'DCA Aeon 2 Noire', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/DCA Aeon 2 Noire' },
    preamp: -3.1,
    bands: [
      b(90, 2.0, 1.0, 'LSQ'), b(115, -2.0, 1.4), b(180, 2.5, 2.0),
      b(1000, 0.8, 1.0), b(3500, 3.0, 2.0), b(5750, -1.0, 2.0),
      b(9750, -5.0, 3.0), b(5000, 1.5, 0.7, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Audeze LCD-5', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Audeze LCD-5' },
    preamp: -6.2,
    bands: [
      b(20, 3.0, 0.7), b(110, 3.2, 0.9, 'LSQ'), b(1450, -2.0, 2.0),
      b(2200, 0.3, 2.0), b(2700, 7.0, 1.0), b(3425, -10.2, 1.4),
      b(4500, 1.0, 2.0), b(5200, 4.2, 1.4), b(7500, 2.7, 1.0, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Philips Fidelio X2HR', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Philips Fidelio X2HR' },
    preamp: -8.0,
    bands: [
      b(20, 11.0, 0.7), b(168, -3.0, 0.6, 'LSQ'), b(265, -1.4, 4.0),
      b(800, -0.5, 3.0), b(1635, -6.0, 2.4), b(1635, 4.2, 1.0),
      b(4000, 1.2, 2.0), b(5200, -5.5, 2.0), b(6300, 4.0, 2.0),
      b(9400, -5.5, 1.4),
    ],
  },
  {
    entry: { name: 'Sennheiser HD 58X', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 58X' },
    preamp: -9.4,
    bands: [
      b(20, 11.5, 0.3), b(34, -3.5, 0.8), b(150, -3.2, 0.6),
      b(550, 0.4, 1.4), b(1375, -0.8, 2.0), b(2600, 1.3, 2.4),
      b(3400, -1.6, 3.5), b(3500, 4.5, 0.6, 'HSQ'), b(9800, -4.8, 2.0),
    ],
  },
  {
    entry: { name: 'DUNU SA6', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/DUNU SA6' },
    preamp: -2.7,
    bands: [
      b(440, 2.5, 0.9), b(1275, -3.0, 0.9), b(2000, -1.3, 1.4),
      b(3325, 4.5, 1.4), b(4600, -7.0, 3.0), b(5900, 5.0, 2.0),
      b(6900, -3.0, 2.0),
    ],
  },
  {
    entry: { name: 'Etymotic ER2XR', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Etymotic ER2XR' },
    preamp: 0,
    bands: [
      b(165, -2.5, 0.8), b(1600, -5.0, 0.7), b(3200, 1.0, 1.4),
      b(3500, -1.5, 0.7, 'HSQ'), b(13500, -5.0, 2.0),
    ],
  },
  {
    entry: { name: 'ZMF Atrium Closed', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/ZMF Atrium Closed' },
    preamp: -4.0,
    bands: [
      b(250, -4.0, 0.4), b(1450, 4.2, 0.7), b(3350, 6.0, 4.0),
      b(3750, -9.0, 3.0), b(5500, 6.0, 2.0), b(8000, -6.0, 2.0),
    ],
  },
  {
    entry: { name: 'Rosson RAD-0', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Rosson RAD-0' },
    preamp: -8.7,
    bands: [
      b(20, 1.0, 2.0), b(90, 7.5, 0.7, 'LSQ'), b(500, 0.6, 2.0),
      b(900, -2.0, 1.0), b(2000, 1.5, 1.4), b(3200, 7.5, 0.5),
      b(4500, 7.0, 0.7, 'HSQ'), b(6000, -4.8, 2.0), b(11000, -7.0, 2.0),
    ],
  },
  {
    entry: { name: 'Nectar Hive', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Nectar Hive' },
    preamp: -6.5,
    bands: [
      b(20, 1.0, 1.4), b(105, 5.5, 0.7, 'LSQ'), b(550, 0.4, 1.4),
      b(1100, -1.8, 1.4), b(2000, 7.0, 2.0), b(2950, -2.4, 2.0),
      b(4500, 0.3, 0.7, 'HSQ'), b(4575, 4.4, 2.2), b(6000, -5.0, 1.9),
    ],
  },
  {
    entry: { name: 'Sennheiser HD 660S', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 660S' },
    preamp: -13.9,
    bands: [
      b(20, 4.0, 1.4), b(60, 13.0, 0.6, 'LSQ'), b(76, 2.4, 1.2),
      b(375, -2.5, 0.7, 'LSQ'), b(1400, -1.1, 1.7), b(2400, 5.5, 0.6, 'HSQ'),
      b(3000, 0.5, 1.4), b(3450, -2.7, 2.5), b(5600, -2.7, 2.0),
      b(10000, -3.0, 2.0),
    ],
  },
  // ── Page 3 ────────────────────────────────
  {
    entry: { name: 'Philips SHP9500', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Philips SHP9500' },
    preamp: -12.0,
    bands: [
      b(20, 12.0, 0.3), b(100, -3.0, 0.7), b(180, -2.0, 1.0),
      b(2225, 3.0, 3.0), b(4400, -3.0, 2.0), b(6000, -6.0, 2.0),
      b(7800, 6.0, 2.0), b(9500, -8.0, 2.0), b(10000, 3.5, 0.7, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Focal Azurys', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Focal Azurys' },
    preamp: -4.5,
    bands: [
      b(1200, 2.4, 1.0), b(2800, 3.0, 2.0), b(3500, -4.0, 2.4),
      b(4900, 6.0, 2.0), b(6300, -2.0, 1.7),
    ],
  },
  {
    entry: { name: 'Sennheiser HD 25', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 25' },
    preamp: -4.0,
    bands: [
      b(20, 8.0, 0.5), b(200, -4.5, 0.7, 'LSQ'), b(200, -3.6, 0.7),
      b(500, 1.2, 1.0), b(1050, -1.0, 2.0), b(2100, -3.6, 1.41),
      b(5400, 6.0, 2.0), b(6000, -0.5, 0.7, 'HSQ'), b(9000, -10.0, 2.0),
    ],
  },
  {
    entry: { name: 'Sennheiser IE 200', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Sennheiser IE 200' },
    preamp: -0.6,
    bands: [
      b(100, 1.0, 0.7, 'LSQ'), b(200, -2.4, 0.7, 'LSQ'), b(1400, -3.6, 1.3),
      b(3500, 2.0, 1.4), b(6600, -5.0, 2.0), b(14000, -11.5, 1.0),
    ],
  },
  {
    entry: { name: 'HIFIMAN HE6se V2', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN HE6se V2' },
    preamp: -6.0,
    bands: [
      b(105, 6.0, 0.7, 'LSQ'), b(1870, 6.5, 1.2), b(3000, -1.5, 3.0),
      b(3500, 0.3, 0.7, 'HSQ'), b(4500, -4.8, 1.4), b(6500, -1.2, 2.0),
    ],
  },
  {
    entry: { name: 'HIFIMAN HE-400i 2020', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN HE-400i 2020' },
    preamp: -8.9,
    bands: [
      b(20, 5.0, 1.0), b(100, 6.0, 0.6, 'LSQ'), b(400, -2.0, 0.8, 'LSQ'),
      b(1900, 3.5, 2.0), b(3000, -0.5, 2.0), b(4500, -2.7, 2.0),
      b(5350, 8.0, 2.0), b(5500, 0.2, 0.7, 'HSQ'), b(6700, -6.0, 2.0),
      b(9500, -5.5, 2.0),
    ],
  },
  {
    entry: { name: 'HIFIMAN Ananda', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN Ananda' },
    preamp: -7.5,
    bands: [
      b(20, 2.2, 0.6), b(80, 5.5, 0.6, 'LSQ'), b(200, -1.5, 1.0),
      b(1690, 5.0, 1.4), b(3250, -2.6, 2.0), b(4650, -1.2, 3.0),
      b(5750, 6.0, 2.0), b(6650, -6.5, 2.0), b(6700, 0.5, 0.7, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Sennheiser HD 560S', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 560S' },
    preamp: -8.1,
    bands: [
      b(20, 3.6, 1.2), b(90, 5.5, 0.7, 'LSQ'), b(250, -1.0, 0.8, 'LSQ'),
      b(1200, -1.0, 2.0), b(1850, 1.0, 3.0), b(2200, -1.7, 1.4),
      b(4400, -4.0, 5.0), b(5000, 0.3, 0.7, 'HSQ'), b(6600, -2.0, 2.0),
      b(7750, 4.8, 2.0),
    ],
  },
  {
    entry: { name: 'HIFIMAN HE-400se', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN HE-400se' },
    preamp: -9.0,
    bands: [
      b(20, 4.2, 1.0), b(85, 4.8, 0.7, 'LSQ'), b(240, -1.0, 1.0),
      b(1000, -1.0, 2.0), b(1950, 5.0, 1.2), b(3750, -2.4, 1.0),
      b(6000, 3.2, 1.0), b(7900, -4.5, 2.0), b(8500, 0.5, 0.7, 'HSQ'),
      b(9850, -2.0, 2.0),
    ],
  },
  {
    entry: { name: 'HIFIMAN Sundara 2020', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN Sundara 2020' },
    preamp: -9.1,
    bands: [
      b(20, 6.5, 0.7), b(55, -0.5, 1.0), b(100, 4.0, 0.7, 'LSQ'),
      b(440, -1.3, 1.0, 'LSQ'), b(900, -1.3, 2.0), b(2250, 2.5, 1.4),
      b(4450, -2.4, 2.0), b(5500, 2.4, 0.7, 'HSQ'), b(5700, 4.8, 2.0),
      b(6350, -2.7, 2.0),
    ],
  },
  // ── Page 4 ────────────────────────────────
  {
    entry: { name: 'Beyerdynamic DT 770 Pro 80 Ohm', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Beyerdynamic DT 770 Pro 80 Ohm' },
    preamp: -2.6,
    bands: [
      b(45, 0.5, 0.7, 'LSQ'), b(110, 2.0, 1.41, 'LSQ'), b(160, -2.0, 1.41, 'LSQ'),
      b(204, 2.6, 2.4), b(9500, -9.0, 1.41),
    ],
  },
  {
    entry: { name: 'Focal Radiance', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Focal Radiance' },
    preamp: -4.8,
    bands: [
      b(55, 3.0, 0.8), b(55, 0.5, 0.7, 'LSQ'), b(130, -7.5, 0.7),
      b(230, 4.8, 1.0), b(1900, -1.8, 3.0), b(3500, -6.0, 2.7),
      b(4100, 7.5, 1.4), b(5000, -0.1, 0.7, 'HSQ'), b(14000, -3.2, 2.0),
    ],
  },
  {
    entry: { name: 'HIFIMAN Susvara', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN Susvara' },
    preamp: -5.5,
    bands: [
      b(100, 5.5, 0.75, 'LSQ'), b(2000, 4.5, 1.0), b(5000, 0.5, 1.41),
      b(10000, -3.2, 1.41),
    ],
  },
  {
    entry: { name: 'Fostex TH900mk2', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Fostex TH900mk2' },
    preamp: -3.3,
    bands: [
      b(50, -4.0, 0.6, 'LSQ'), b(150, -7.2, 0.5), b(490, 2.5, 1.4),
      b(1000, -2.0, 1.4), b(2550, 4.2, 2.4), b(4500, -1.5, 0.7, 'HSQ'),
      b(5500, -6.0, 2.0), b(11000, -6.5, 2.0),
    ],
  },
  {
    entry: { name: 'HIFIMAN Arya V1', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN Arya V1' },
    preamp: -6.0,
    bands: [
      b(88, 6.0, 0.7, 'LSQ'), b(1000, 7.0, 0.6, 'HSQ'), b(1000, -1.5, 2.0),
      b(2350, -7.0, 1.0, 'HSQ'), b(5750, 6.0, 2.0), b(6500, -7.0, 2.0),
      b(11000, -0.5, 2.0),
    ],
  },
  {
    entry: { name: 'Modhouse Tungsten', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Modhouse Tungsten' },
    preamp: -8.0,
    bands: [
      b(20, 6.0, 0.5), b(100, 2.0, 1.1, 'LSQ'), b(650, 0.6, 2.0),
      b(1800, 6.0, 2.0), b(1800, -2.0, 4.0), b(3500, -1.0, 3.0),
      b(4800, 5.0, 2.4), b(5500, -2.0, 2.0), b(6000, 0.5, 0.7, 'HSQ'),
      b(9500, -3.2, 1.4),
    ],
  },
  {
    entry: { name: '64 Audio Volur', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/64 Audio Volur' },
    preamp: -3.6,
    bands: [
      b(24, -1.8, 1.0), b(32, -2.7, 0.1), b(240, -1.5, 1.4),
      b(540, 0.9, 1.0), b(1800, -3.0, 1.4), b(2100, -1.5, 4.0),
      b(3100, 4.5, 1.4), b(4450, -5.5, 3.2), b(6000, -2.5, 2.0),
      b(9500, 6.0, 2.0),
    ],
  },
  {
    entry: { name: 'Sennheiser IE 600', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Sennheiser IE 600' },
    preamp: -2.9,
    bands: [
      b(150, 1.0, 0.8, 'LSQ'), b(240, -1.0, 0.8, 'LSQ'), b(500, 3.0, 1.0),
      b(1800, -1.0, 2.0), b(2500, 2.3, 1.4, 'HSQ'), b(8000, -7.0, 0.7, 'HSQ'),
      b(9000, -4.5, 2.0),
    ],
  },
  {
    entry: { name: 'Sennheiser IE 900', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Sennheiser IE 900' },
    preamp: -5.3,
    bands: [
      b(500, -0.5, 0.7), b(300, -2.3, 0.8, 'LSQ'), b(900, -4.5, 1.0, 'HSQ'),
      b(3150, 9.5, 1.0), b(4650, -1.8, 2.0, 'HSQ'), b(1700, -2.0, 2.0),
      b(8000, 1.2, 1.4, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Thieaudio Monarch Mk3', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Thieaudio Monarch Mk3' },
    preamp: -4.0,
    bands: [
      b(105, 0.5, 0.7, 'LSQ'), b(410, 4.0, 0.7), b(1650, -1.0, 1.0),
      b(3000, 3.0, 1.4), b(5750, -5.0, 1.4), b(9000, 5.0, 2.0),
      b(9000, 1.0, 0.7, 'HSQ'), b(14300, -9.5, 1.4),
    ],
  },
  {
    entry: { name: 'Letshuoer S12', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Letshuoer S12' },
    preamp: 0,
    bands: [
      b(105, 3.0, 0.7, 'LSQ'), b(270, -5.5, 0.8, 'LSQ'), b(1700, -4.0, 1.0),
      b(3250, 3.0, 2.0), b(8900, -9.0, 0.6),
    ],
  },
  {
    entry: { name: 'Moondrop Blessing 3', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Moondrop Blessing 3' },
    preamp: 0,
    bands: [
      b(80, 2.0, 0.7), b(250, -3.0, 0.7, 'LSQ'), b(900, -7.0, 0.7, 'HSQ'),
      b(2250, 4.3, 1.0), b(3650, 0.5, 2.0, 'HSQ'), b(6000, -2.0, 2.0),
      b(8000, 2.7, 1.0),
    ],
  },
  {
    entry: { name: 'HIFIMAN HE1000V2', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN HE1000V2' },
    preamp: -6.0,
    bands: [
      b(100, 6.0, 0.7, 'LSQ'), b(600, 4.0, 0.6, 'HSQ'), b(1000, -1.5, 3.0),
      b(2000, 1.2, 2.0), b(2200, -4.0, 1.0, 'HSQ'), b(3500, 1.0, 1.0, 'HSQ'),
      b(7800, -3.0, 1.4), b(11000, -1.0, 2.0),
    ],
  },
  {
    entry: { name: 'Meze 109 Pro', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Meze 109 Pro' },
    preamp: -4.5,
    bands: [
      b(20, 4.0, 0.3), b(155, -3.2, 0.6), b(1800, 4.8, 1.4),
      b(3900, -4.5, 2.4), b(4975, 3.5, 2.0), b(7500, -6.0, 2.0),
      b(8000, 2.0, 0.7, 'HSQ'), b(11000, 3.0, 2.0), b(13500, -11.0, 2.0),
    ],
  },
  {
    entry: { name: 'HEDDphone V1', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HEDDphone V1' },
    preamp: -6.1,
    bands: [
      b(20, 3.0, 1.0), b(95, 3.2, 0.7, 'LSQ'), b(250, -4.0, 0.6),
      b(525, 3.0, 2.0), b(725, -3.5, 3.0), b(2000, 2.4, 3.0),
      b(3350, -2.0, 3.0), b(7000, 3.0, 0.7, 'HSQ'), b(14200, -5.3, 0.7),
    ],
  },
  // ── Page 5 ────────────────────────────────
  {
    entry: { name: 'Meze Empyrean II', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Meze Empyrean II' },
    preamp: -5.6,
    bands: [
      b(20, 1.5, 1.4), b(75, 4.5, 0.5, 'LSQ'), b(190, -4.5, 0.6),
      b(450, 1.1, 0.7), b(1500, 2.4, 2.1), b(3500, -4.5, 0.7, 'HSQ'),
      b(4800, 3.0, 3.0), b(7000, 3.2, 2.0), b(6300, -4.0, 2.0),
      b(3500, -1.0, 4.0),
    ],
  },
  {
    entry: { name: 'Campfire Cascade', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Campfire Cascade' },
    preamp: -0.7,
    bands: [
      b(20, 1.5, 1.0), b(142, -9.5, 0.5), b(360, 4.0, 1.8),
      b(630, 1.1, 1.4), b(4350, 3.0, 3.0), b(5500, -5.2, 2.0),
      b(7500, 4.2, 2.0), b(10650, -10.0, 2.0),
    ],
  },
  {
    entry: { name: 'Sennheiser HD 490 Pro', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 490 Pro' },
    preamp: -5.7,
    bands: [
      b(20, 4.0, 1.0), b(100, 1.8, 0.7, 'LSQ'), b(180, -1.9, 0.6),
      b(1800, 2.7, 1.4), b(4200, -6.3, 2.0), b(5000, 4.0, 2.0),
      b(6300, -6.0, 2.0), b(7650, 5.0, 2.0), b(9000, -4.8, 2.0),
      b(3250, 2.0, 2.0),
    ],
  },
  // ── Page 6 ────────────────────────────────
  {
    entry: { name: 'Focal Bathys', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Focal Bathys' },
    preamp: -5.0,
    bands: [
      b(105, -0.5, 1.0, 'LSQ'), b(350, -2.4, 0.7), b(850, 6.0, 1.4),
      b(1100, -2.0, 2.0), b(2450, 2.5, 3.0), b(3000, 0.5, 0.7, 'HSQ'),
      b(3200, -1.8, 2.0), b(5000, 6.3, 1.4), b(10000, -6.3, 1.0),
    ],
  },
  {
    entry: { name: 'HIFIMAN HE-560 V4', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN HE-560 V4' },
    preamp: -6.0,
    bands: [
      b(95, 6.0, 0.7, 'LSQ'), b(2100, 6.4, 1.4), b(4000, -3.0, 1.4),
      b(5000, 1.2, 0.7, 'HSQ'), b(10000, -6.0, 1.0), b(1050, -0.8, 2.0),
    ],
  },
  {
    entry: { name: 'HIFIMAN Arya Organic', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN Arya Organic' },
    preamp: -3.3,
    bands: [
      b(80, 3.5, 0.5, 'LSQ'), b(95, -1.2, 1.4), b(300, -1.5, 0.8),
      b(1725, 3.2, 2.7), b(2225, 2.1, 5.0), b(3000, -2.4, 1.8),
      b(6300, -6.0, 0.8, 'HSQ'), b(6500, -0.2, 2.0), b(11000, -1.0, 2.0),
    ],
  },
  {
    entry: { name: 'Focal Elex', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Focal Elex' },
    preamp: -6.7,
    bands: [
      b(20, 4.0, 0.6), b(90, 2.8, 0.7, 'LSQ'), b(185, -2.0, 0.6),
      b(630, 0.8, 1.0), b(1500, -2.8, 1.1), b(2100, 1.2, 3.0),
      b(2700, 1.8, 1.9), b(3550, -1.8, 3.0), b(4500, 1.0, 0.8, 'HSQ'),
      b(4800, 5.0, 2.0),
    ],
  },
  {
    entry: { name: 'Sennheiser HD 600', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 600' },
    preamp: -10.8,
    bands: [
      b(20, 5.5, 1.0), b(65, 5.5, 0.7, 'LSQ'), b(78, 1.0, 2.7),
      b(195, -3.4, 0.48), b(725, 1.3, 0.7), b(1500, -3.0, 0.5),
      b(2000, 0.3, 3.0), b(3333, -2.4, 2.7), b(5000, 1.0, 2.0),
      b(7000, -1.5, 0.9, 'HSQ'),
    ],
  },
  // ── Page 7 ────────────────────────────────
  {
    entry: { name: 'Truthear Zero', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Truthear Zero' },
    preamp: -3.0,
    bands: [
      b(20, 3.0, 0.7), b(135, -3.7, 0.9, 'LSQ'), b(240, 1.5, 0.7, 'LSQ'),
      b(425, 2.8, 0.5), b(1500, -1.8, 1.0), b(3000, 0.7, 1.4),
      b(4850, -4.0, 2.0), b(8000, -0.5, 0.7, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Sennheiser HD 620S', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 620S' },
    preamp: -2.5,
    bands: [
      b(82, 3.2, 1.4, 'LSQ'), b(125, -2.7, 1.4), b(227, 3.3, 1.8),
      b(750, -1.2, 2.0, 'LSQ'), b(1650, 1.5, 1.4), b(2700, -2.2, 2.7),
      b(4500, 2.0, 2.0), b(9000, -2.0, 2.0),
    ],
  },
  {
    entry: { name: 'Drop x Koss ESP95x', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Drop x Koss ESP95x' },
    preamp: -6.4,
    bands: [
      b(90, 6.4, 0.7, 'LSQ'), b(1150, -3.6, 1.4), b(2200, 3.2, 2.0),
      b(3500, -1.5, 3.0), b(4000, 6.0, 0.7, 'HSQ'), b(4200, 6.0, 1.8),
      b(5500, -6.4, 1.6), b(7250, 3.0, 2.0), b(11500, -7.0, 1.4),
    ],
  },
  {
    entry: { name: 'Grell OAE-1', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Grell OAE-1' },
    preamp: -6.0,
    bands: [
      b(72, 2.0, 1.4), b(150, -7.2, 0.2), b(650, 3.0, 0.9),
      b(925, -2.0, 2.4), b(1300, 1.4, 1.0), b(3200, -2.0, 2.0),
      b(4750, -9.5, 1.8), b(5900, 10.0, 3.2), b(9900, -5.0, 2.0, 'HSQ'),
    ],
  },
  // ── Page 8 ────────────────────────────────
  {
    entry: { name: 'Audeze Maxwell', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Audeze Maxwell' },
    preamp: -3.8,
    bands: [
      b(20, 3.0, 3.0), b(140, -1.6, 1.0), b(220, 0.8, 2.0),
      b(400, -1.0, 2.0), b(850, 0.8, 1.4), b(7000, 6.0, 2.0),
      b(9000, -4.0, 1.4),
    ],
  },
  {
    entry: { name: 'Beyerdynamic DT 990', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Beyerdynamic DT 990' },
    preamp: -7.5,
    bands: [
      b(20, 8.0, 0.2), b(20, 3.5, 1.4), b(150, -2.2, 1.0),
      b(280, -4.0, 0.8, 'LSQ'), b(675, 1.5, 2.0), b(4200, 2.4, 2.0),
      b(8650, -10.0, 1.2),
    ],
  },
  {
    entry: { name: 'Sony WH-1000XM4', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sony WH-1000XM4' },
    preamp: -3.4,
    bands: [
      b(127, -6.0, 0.8), b(395, 1.5, 2.0), b(1000, 1.8, 2.0),
      b(2450, 4.0, 1.2), b(4000, -1.2, 1.4), b(9000, -3.0, 1.4),
      b(105, -0.5, 0.7, 'LSQ'), b(2500, -0.5, 0.42, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Beyerdynamic DT 700 Pro X', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Beyerdynamic DT 700 Pro X' },
    preamp: -4.4,
    bands: [
      b(82, 2.7, 1.1, 'LSQ'), b(150, -2.2, 1.0), b(256, 5.5, 1.4),
      b(1900, -1.8, 2.0), b(3200, 4.0, 3.0), b(8600, -4.0, 1.0),
    ],
  },
  {
    entry: { name: 'Beyerdynamic DT 900 Pro X', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Beyerdynamic DT 900 Pro X' },
    preamp: -4.1,
    bands: [
      b(20, 2.1, 1.4), b(90, 2.0, 1.0, 'LSQ'), b(230, -2.7, 0.5),
      b(1400, 1.8, 1.4), b(3200, 5.5, 2.0), b(6500, -6.0, 0.4),
    ],
  },
  {
    entry: { name: 'Sennheiser HD 700', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 700' },
    preamp: -7.1,
    bands: [
      b(20, 8.0, 0.7), b(60, 3.5, 0.7), b(105, -1.5, 0.7, 'LSQ'),
      b(190, -5.2, 0.5), b(1000, -0.9, 2.0), b(1950, 5.2, 1.0),
      b(3750, 2.5, 3.0), b(6350, -8.0, 2.4),
    ],
  },
  // ── Page 9 ────────────────────────────────
  {
    entry: { name: 'Sony MDR-MV1', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sony MDR-MV1' },
    preamp: -3.8,
    bands: [
      b(20, 3.0, 2.0), b(195, -4.0, 0.5), b(750, 0.6, 2.0),
      b(1000, -0.7, 0.7), b(2000, 1.3, 2.0), b(3000, 2.8, 0.3),
      b(4675, 11.0, 2.0), b(6600, -12.5, 0.6),
    ],
  },
  {
    entry: { name: 'Focal Celestee', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Focal Celestee' },
    preamp: -6.1,
    bands: [
      b(71, 3.6, 1.4, 'LSQ'), b(160, -1.4, 1.4, 'LSQ'), b(210, 2.0, 0.6),
      b(1900, -0.5, 2.0), b(3100, -3.0, 1.4), b(3450, -1.0, 5.0),
      b(4175, 7.8, 1.2), b(7000, 1.0, 2.0), b(8800, -1.8, 2.0),
    ],
  },
  {
    entry: { name: 'Samsung Galaxy Buds FE', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Samsung Galaxy Buds FE' },
    preamp: -2.3,
    bands: [
      b(105, -2.7, 0.7, 'LSQ'), b(425, -4.0, 0.7, 'LSQ'), b(1650, -3.0, 1.4),
      b(2500, 0.5, 0.42, 'HSQ'), b(5900, -5.5, 1.4), b(10000, 2.0, 0.4, 'HSQ'),
    ],
  },
  // ── Page 10 ────────────────────────────────
  {
    entry: { name: '7Hz Timeless', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/7Hz Timeless' },
    preamp: -0.6,
    bands: [
      b(270, -2.3, 1.2, 'LSQ'), b(2000, -5.0, 1.1), b(3050, 3.2, 2.0),
      b(7500, -7.5, 0.7, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Thieaudio Oracle Mk3', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Thieaudio Oracle Mk3' },
    preamp: 0,
    bands: [
      b(90, 1.4, 0.7), b(270, -4.5, 0.8, 'LSQ'), b(550, 0.8, 1.0),
      b(1450, -3.2, 0.7), b(2150, -1.6, 2.0), b(3450, 2.0, 3.0),
      b(4750, -1.8, 4.0), b(6300, -3.6, 2.0), b(9200, 4.5, 2.0),
      b(10600, -1.5, 2.0),
    ],
  },
  {
    entry: { name: 'AKG K712 Pro', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/AKG K712 Pro' },
    preamp: -4.6,
    bands: [
      b(20, 2.4, 1.4), b(82, 2.4, 0.7, 'LSQ'), b(250, -5.7, 0.4),
      b(1300, 2.4, 1.1), b(2100, -6.3, 2.0), b(3000, 3.5, 3.0),
      b(4225, -2.0, 4.0), b(5300, 3.6, 2.0), b(8000, -7.5, 1.0),
      b(10000, 3.0, 1.0, 'HSQ'),
    ],
  },
  {
    entry: { name: 'HIFIMAN HE1000 Stealth', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HIFIMAN HE1000 Stealth' },
    preamp: -4.6,
    bands: [
      b(22, 3.2, 0.3), b(200, -2.6, 0.5), b(630, 0.8, 2.0),
      b(1050, -1.0, 2.0), b(1820, 5.1, 2.2), b(2200, 1.5, 4.7),
      b(3000, -3.8, 2.0), b(3900, 3.6, 3.0), b(5200, -3.5, 1.4),
      b(6000, -7.0, 0.8, 'HSQ'),
    ],
  },
  {
    entry: { name: '64 Audio U6t', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/64 Audio U6t' },
    preamp: -2.0,
    bands: [
      b(125, 1.8, 1.0, 'LSQ'), b(240, -3.0, 0.8, 'LSQ'), b(2050, -1.8, 2.7),
      b(3250, 0.5, 2.0), b(4925, -4.2, 3.0), b(6450, 3.0, 1.4),
      b(14700, -9.0, 3.0),
    ],
  },
  // ── Page 11 ────────────────────────────────
  {
    entry: { name: 'Beyerdynamic TYGR 300R', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Beyerdynamic TYGR 300R' },
    preamp: -3.3,
    bands: [
      b(20, 3.5, 1.0), b(180, -5.0, 0.6), b(800, 1.4, 1.4),
      b(3000, 0.5, 1.4), b(4600, 2.0, 3.0), b(5555, -7.5, 1.4),
      b(7000, 7.0, 2.0), b(10000, -8.0, 1.4),
    ],
  },
  {
    entry: { name: 'FiiO FT-1', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/FiiO FT-1' },
    preamp: -2.3,
    bands: [
      b(135, -5.0, 0.7), b(1050, -1.4, 2.0), b(1850, -2.7, 3.0),
      b(2850, -1.2, 2.0), b(3900, 4.0, 2.0), b(5300, -2.9, 2.0),
      b(16000, -6.0, 1.4),
    ],
  },
  {
    entry: { name: 'Symphonium Crimson', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Symphonium Crimson' },
    preamp: -3.3,
    bands: [
      b(450, 2.0, 0.3), b(1900, -0.9, 0.8), b(3100, 2.0, 3.0),
      b(7000, -2.4, 2.0), b(10600, -3.4, 3.6, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Philphone', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Philphone' },
    preamp: -5.4,
    bands: [
      b(20, 5.5, 1.3), b(150, -2.7, 0.7), b(500, 1.0, 1.4),
      b(1500, -4.2, 1.0), b(2750, 7.5, 2.2), b(3750, -4.5, 3.0),
      b(4900, 6.0, 2.0), b(5500, -9.0, 2.0), b(7250, 9.0, 2.0),
      b(9000, -5.0, 2.0),
    ],
  },
  {
    entry: { name: 'Focal Hadenys', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Focal Hadenys' },
    preamp: -3.4,
    bands: [
      b(20, 3.5, 1.4), b(155, -2.1, 0.7), b(525, 0.5, 1.0),
      b(1100, -0.8, 1.4), b(2600, 2.4, 2.0), b(3650, -3.4, 3.0),
      b(5000, 1.8, 3.0), b(9000, -3.6, 2.0),
    ],
  },
  {
    entry: { name: 'Focal Elegia', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Focal Elegia' },
    preamp: -10.3,
    bands: [
      b(71, 3.2, 0.8, 'LSQ'), b(200, 1.4, 1.4, 'LSQ'), b(1850, -2.0, 3.0),
      b(2150, 3.0, 4.0), b(4150, 10.0, 2.0), b(6900, 2.4, 2.0),
      b(12000, 3.6, 1.0, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Kiwi Ears KE4', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Kiwi Ears KE4' },
    preamp: -2.2,
    bands: [
      b(23, -2.9, 0.4), b(650, -0.8, 1.7), b(2000, 1.7, 1.8),
      b(2400, 0.7, 2.0), b(5000, -1.3, 2.0), b(6100, 0.7, 2.0),
      b(7300, -1.6, 2.0), b(8000, 1.6, 1.0),
    ],
  },
  // ── Page 12 ────────────────────────────────
  {
    entry: { name: 'Sony MDR-Z1R', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sony MDR-Z1R' },
    preamp: -8.9,
    bands: [
      b(65, 2.2, 2.0), b(140, -5.0, 0.6), b(2815, 7.0, 7.0),
      b(3300, -12.0, 1.8), b(4050, 6.0, 4.0), b(4200, 12.0, 1.0),
      b(5000, -1.5, 3.0), b(9600, -9.0, 1.0),
    ],
  },
  {
    entry: { name: 'DCA E3', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/DCA E3' },
    preamp: -0.4,
    bands: [
      b(1250, 1.0, 1.0), b(2500, -2.0, 0.42, 'HSQ'), b(3900, -2.5, 2.0),
    ],
  },
  {
    entry: { name: 'Meze Alba', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Meze Alba' },
    preamp: -0.1,
    bands: [
      b(333, -2.8, 0.9, 'LSQ'), b(925, -3.2, 0.9, 'HSQ'), b(2850, 2.0, 3.0),
      b(6200, -3.4, 3.0), b(12000, -3.6, 3.0, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Audeze MM-500', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Audeze MM-500' },
    preamp: -7.5,
    bands: [
      b(23, 2.5, 1.0), b(95, 5.0, 0.7, 'LSQ'), b(230, -1.2, 1.1),
      b(3150, -2.0, 4.0), b(3600, 4.2, 0.7, 'HSQ'), b(4350, 3.0, 5.0),
      b(7000, -3.0, 2.0), b(13000, -5.5, 1.4, 'HSQ'),
    ],
  },
  {
    entry: { name: 'AKG K361', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/AKG K361' },
    preamp: -6.2,
    bands: [
      b(145, -2.4, 1.3), b(400, 0.4, 0.5), b(1250, -2.0, 1.0),
      b(3960, 6.5, 3.0), b(9300, -9.0, 4.0),
    ],
  },
  // ── Page 13 ────────────────────────────────
  {
    entry: { name: 'Moondrop Kato', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Moondrop Kato' },
    preamp: -2.9,
    bands: [
      b(72, 2.3, 1.8), b(150, -2.0, 0.9), b(430, 3.3, 0.7),
      b(1800, -2.8, 1.3), b(3350, 1.9, 3.0), b(5600, -3.0, 1.0),
    ],
  },
  // ── Page 14 ────────────────────────────────
  {
    entry: { name: 'Shure SRH-840A', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Shure SRH-840A' },
    preamp: -1.5,
    bands: [
      b(20, 4.0, 0.4), b(105, -1.8, 0.7, 'LSQ'), b(200, -2.2, 1.8, 'LSQ'),
      b(535, -3.0, 1.2, 'LSQ'), b(1020, -1.3, 2.4), b(2500, -0.5, 0.42, 'HSQ'),
      b(3100, -1.7, 2.0), b(4650, -2.0, 3.0, 'HSQ'), b(6500, -2.0, 1.8, 'HSQ'),
    ],
  },
  {
    entry: { name: 'HEDDphone V2', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/HEDDphone V2' },
    preamp: -5.4,
    bands: [
      b(20, 9.0, 0.3), b(220, -1.4, 1.2), b(750, 0.9, 2.0),
      b(1900, -3.6, 1.3, 'LSQ'), b(3200, -1.0, 2.0), b(4850, -2.0, 5.0),
      b(9450, -3.6, 2.0, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Focal Utopia OG', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Focal Utopia OG' },
    preamp: -6.6,
    bands: [
      b(70, 7.5, 0.45, 'LSQ'), b(170, -3.2, 0.6), b(925, -2.8, 1.2, 'HSQ'),
      b(1950, 3.0, 3.0), b(2000, 2.7, 0.8, 'HSQ'), b(5500, -0.8, 2.0, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Sennheiser HD 660S2', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 660S2' },
    preamp: -8.7,
    bands: [
      b(40, -2.0, 1.0), b(100, 10.0, 0.5, 'LSQ'), b(150, -4.3, 0.5),
      b(633, 0.6, 1.0), b(1125, -2.0, 2.0), b(1700, -1.0, 2.0),
      b(2500, 2.7, 0.42, 'HSQ'), b(3250, -0.8, 5.0), b(4600, 2.4, 5.0),
      b(4800, -2.7, 1.4, 'HSQ'),
    ],
  },
  {
    entry: { name: 'Thieaudio Hype 4', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Thieaudio Hype 4' },
    preamp: -2.4,
    bands: [
      b(105, -3.2, 0.7, 'LSQ'), b(440, 2.0, 1.1), b(700, 0.8, 0.7),
      b(1250, -1.0, 1.0), b(3550, 1.0, 2.0), b(5200, -3.7, 1.8),
      b(7500, 1.2, 2.0), b(10000, -2.5, 2.0, 'HSQ'),
    ],
  },
  {
    entry: { name: 'AKG K240 Mk2', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/AKG K240 Mk2' },
    preamp: -16.0,
    bands: [
      b(21, 14.2, 0.4), b(160, -5.0, 0.7), b(370, -1.5, 2.5),
      b(1600, 4.4, 2.5), b(2900, -2.1, 2.0), b(3500, 4.5, 5.0),
      b(4400, 3.8, 2.0), b(5600, 4.6, 4.6), b(7500, -4.5, 2.2),
      b(9700, -3.8, 3.6),
    ],
  },
  // ── Page 16 ────────────────────────────────
  {
    entry: { name: 'Meze 105 AER', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Meze 105 AER' },
    preamp: -5.8,
    bands: [
      b(20, 6.0, 0.5), b(155, -2.5, 0.5), b(425, 0.9, 2.0),
      b(950, -0.6, 2.0), b(2300, 2.3, 1.2), b(3900, -7.0, 2.4),
      b(6150, -5.0, 4.0), b(7750, 2.0, 2.0), b(9500, -4.0, 2.0, 'HSQ'),
    ],
  },
  // ── Page 17 ────────────────────────────────
  {
    entry: { name: 'Sennheiser HD 599', source: 'Resolve', form: 'over-ear', path: 'resolve/over-ear/Sennheiser HD 599' },
    preamp: -7.0,
    bands: [
      b(73, -7.0, 0.4), b(105, 9.5, 0.7, 'LSQ'), b(1700, 3.6, 1.41),
      b(4250, -3.6, 1.41), b(7200, 3.6, 1.41), b(8800, -2.0, 2.0),
    ],
  },
  {
    entry: { name: 'Audeze iSine 20', source: 'Resolve', form: 'in-ear', path: 'resolve/in-ear/Audeze iSine 20' },
    preamp: -13.6,
    bands: [
      b(105, 6.3, 0.5, 'LSQ'), b(1550, -5.0, 1.0), b(2950, 15.0, 1.41),
      b(4200, -4.8, 1.4), b(5200, 12.0, 2.7), b(8500, 9.0, 2.0),
      b(10800, -3.5, 2.0), b(880, -0.5, 2.0),
    ],
  },
];
