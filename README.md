# OpenPEQ

A browser-based parametric EQ configurator for USB DAC/Amps using the WebHID API. Configure your device's parametric EQ directly from the browser — no drivers or desktop software needed.

## Features

- **WebHID device control** — connect to compatible USB DAC/Amps directly from the browser
- **10-band parametric EQ** — PK, LSQ, HSQ filter types with real-time frequency response graph
- **Community EQ Library** — 6,000+ headphone EQ profiles from AutoEQ + 75 curated profiles from Resolve
- **Preset management** — import/export AutoEQ `.txt` files, save/load local presets
- **Undo/Redo** — full history with keyboard shortcuts
- **A/B compare** — quickly toggle between two EQ configurations
- **Save to flash** — persist EQ settings on device across power cycles
- **Favorites** — bookmark community profiles for quick access
- **Keyboard shortcuts** — Ctrl+Z/Y undo/redo, Ctrl+S save, Ctrl+Shift+S save to flash, and more

## Tech Stack

React 19, TypeScript, Tailwind CSS 4, Zustand 5, Vite 7

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in a Chromium-based browser (Chrome, Edge, Opera — WebHID is not supported in Firefox/Safari).

## Credits & Acknowledgments

This project would not be possible without the work of the following people and projects:

### EQ Data Sources

- **[AutoEQ](https://github.com/jaakkopasanen/AutoEq)** by Jaakko Pasanen — the backbone of the Community EQ Library, providing 6,000+ automatically generated headphone EQ profiles from 26 measurement sources
- **[Resolve (Andrew Park)](https://www.headphones.com/pages/measurments-and-eq)** at headphones.com — 75 curated parametric EQ profiles from the [headphones.com EQ Repository](https://forum.headphones.com/t/eq-repository/19481), hand-tuned for accuracy and listenability

### AutoEQ Measurement Sources

The AutoEQ database aggregates measurements from these contributors:

| Source | Contributor |
|--------|------------|
| [oratory1990](https://www.reddit.com/r/oratory1990/) | oratory1990 |
| [crinacle](https://crinacle.com/) | crinacle |
| [Rtings](https://www.rtings.com/) | Rtings.com |
| [Innerfidelity](https://www.innerfidelity.com/) | Tyll Hertsens |
| [Super Review](https://www.youtube.com/@SuperReview) | Super Review |
| [HypetheSonics](https://www.hypethesonics.com/) | HypetheSonics |
| [Kuulokenurkka](https://kuulokenurkka.fi/) | Kuulokenurkka |
| [Headphone.com Legacy](https://www.headphone.com/) | Headphone.com |
| Harpo | Harpo |
| Fahryst | Fahryst |
| Filk | Filk |
| DHRME | DHRME |
| Bakkwatan | Bakkwatan |
| Auriculares Argentina | Auriculares Argentina |
| Hi End Portable | Hi End Portable |
| Jaytiss | Jaytiss |
| Kazi | Kazi |
| Regan Cipher | Regan Cipher |
| RikudouGoku | RikudouGoku |
| Ted's Squig Hoard | Ted's Squig Hoard |
| ToneDeafMonk | ToneDeafMonk |
| freeryder05 | freeryder05 |
| kr0mka | kr0mka |

### DSP Reference

- Biquad filter coefficient formulas based on Robert Bristow-Johnson's [Audio EQ Cookbook](https://www.w3.org/2011/audio/audio-eq-cookbook.html)

## License

MIT
