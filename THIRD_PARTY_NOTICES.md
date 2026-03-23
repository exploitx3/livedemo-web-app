# Third-party notices

The application code in this repository is licensed under the MIT License (see [LICENSE](./LICENSE)), **except** where noted below. Those components remain under their original licenses; you must retain their notices and comply with their terms when you copy or distribute this software.

---

## LAME / lamejs (`lame.all.js`) — GNU LGPL 2.1

| | |
| --- | --- |
| **Path** | `src/injectScript/injectScriptComponents/RoundAudioPlayerEditor/components/EditAudio/lame.all.js` |
| **License** | GNU **Lesser** General Public License, version **2.1** (LGPL-2.1) |
| **Full text** | [third-party-licenses/LGPL-2.1.txt](./third-party-licenses/LGPL-2.1.txt) |
| **LAME project** | [https://lame.sourceforge.net/](https://lame.sourceforge.net/) |
| **LAME FAQ (commercial / LGPL)** | [third-party-licenses/LAME-project-FAQ-commercial-use.txt](./third-party-licenses/LAME-project-FAQ-commercial-use.txt) (verbatim excerpt) |

This file is a JavaScript build of LAME-derived MP3 encoding (e.g. `lame.all.js` / `lame.min.js` style). Multiple copyright holders and license notices appear **inside the file**. The LGPL-2.1 applies to the corresponding library portions.

**Upstream lineage:** Aligned with the [lamejs](https://github.com/zhuker/lamejs) JavaScript port and the [LAME](https://lame.sourceforge.net/) codebase.

The LAME project describes commercial use under the LGPL as follows (paraphrased from their FAQ; see the project site for the current wording):

> You may use LAME in a commercial program **under the restrictions of the LGPL**. The suggested approach is:
>
> 1. **Link to LAME as a separate library** (in our case the encoder is kept as the standalone module `lame.all.js`, not merged into unrelated application source in a way that obscures which code is LAME).
> 2. **Acknowledge that you are using LAME** and **provide a link** to the LAME website: [https://lame.sourceforge.net/](https://lame.sourceforge.net/)
> 3. **If you modify LAME** (including this file), you **must** release those modifications back to the LAME project **under the LGPL**, as required by the license.

**This repository:** Keep `lame.all.js` identifiable as the LAME/lamejs module; retain this notice and the LGPL text; do not strip in-file copyright headers; if you fork and change this file, comply with LGPL for those changes (including contribution expectations above). For bundled web apps, also include acknowledgment and the LAME link in shipped documentation or an “About” / credits screen where you list third-party software.

---

## Payment card SVG icons (`payment-icons`) — Mozilla Public License 2.0

| | |
| --- | --- |
| **Package** | `payment-icons` (npm) |
| **Usage** | SVG imports in `src/utils/CardToIconMap.js` |
| **Project** | [muffinresearch/payment-icons](https://github.com/muffinresearch/payment-icons) |
| **License** | **MPL-2.0** |
| **Full text** | [third-party-licenses/MPL-2.0.txt](./third-party-licenses/MPL-2.0.txt) |

**Copyright:** Stuart Colville and contributors (see the package and repository).

**MPL-2.0 summary:** The license applies **per file** to the covered SVGs and other MPL-licensed sources. Keep copyright notices and the MPL header/notice where required; if you modify MPL-covered files, MPL’s file-level copyleft rules apply to those files. See the full license text for details.

---

## Other npm dependencies

Most other dependencies are MIT, ISC, BSD, Apache-2.0, or similarly permissive. Their license metadata is in `package-lock.json` / each package’s `package.json` under `node_modules/`. This document highlights **vendored** LGPL code and **MPL** assets that are easy to miss in a typical MIT project.
