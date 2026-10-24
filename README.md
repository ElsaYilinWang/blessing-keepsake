# Blessing Portrait / Keepsake Card

**Live website:** https://blessing-keepsake.elsa-yilin-w39.workers.dev/

**Business edition:** public source repository (owner-selected visibility) plus a browser-based card studio in web/.
Illustrations are created manually in ChatGPT; the website makes the layout and downloads.
Read [the step-by-step publishing guide](docs/PUBLISHING.md) for GitHub, Cloudflare and licence choices.

To preview locally: `python -m http.server 8765 --directory web`, then open http://localhost:8765.

A small, local Python project for turning **approved illustrations** into warm, printable keepsakes.
Inspired by a soft coloured-pencil / subtle-watercolour workflow: recognisable people,
real poses, meaningful details, restrained cream tones, and a little story worth keeping.

**10 × 15 cm is the primary print format.** At 300 DPI the nearest integer raster is
**1181 × 1772 px** (portrait), or **1772 × 1181 px** (landscape).
Pixel rounding means the physical size is approximate. This is not exactly the same as 4 × 6 inches.
Choose the print shop's 10 × 15 cm option and inspect its crop preview.

## Quick start
Requires Python 3.10+ and Pillow. From the repository root:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m pip install --no-deps -e .
python scripts/make_sample_assets.py
keepsake --config templates/card.example.json --out exports/demo
```

On macOS/Linux use `source .venv/bin/activate`. If the shell entry point is unavailable,
use `python -m keepsake` with the same arguments. Included assets are original abstract
landscape placeholders: no private photos, no generated human likenesses.

## Your own card
Create `private/`, copy a template there and edit it. Image and optional font paths resolve
**relative to the JSON file**, not your shell's current directory.
Place your approved artwork beside the private config and set e.g.
`"images": [{"path": "illustration.png"}]`.
Use exactly one or four images. Four images appear in row-major order: top-left, top-right,
bottom-left, bottom-right. Change `"orientation"` to `"landscape"` if desired.

Names → illustration(s) → blessing → context → optional place/date.
The blessing looks forward; the context celebrates the actual memories without repeating it.
See the must-preserve lists and manual review fields in the sample config.

```powershell
keepsake --config private/card.json --out exports/friend --target preview
keepsake --config private/card.json --out exports/friend --target wallpaper
keepsake --config private/card.json --out exports/friend --target print
keepsake --config templates/four-memories.example.json --out exports/four
```

Default `--target all` writes:
| File | Purpose |
|---|---|
| print-10x15.png | Lossless RGB print master, 300 DPI, embedded sRGB profile |
| print-10x15.jpg | High-quality photo-kiosk alternative, 300 DPI, embedded sRGB |
| preview.jpg | Long edge up to 900 px; review and private sharing |
| wallpaper-1080x2400.png | Whole card padded on a 1080 × 2400 canvas |

The phone output reserves upper space for a lock-screen clock; actual device crops vary.
It preserves the entire card, including landscape cards, rather than cropping to fill.
Outputs with the same names are overwritten; choose a new output folder to keep versions.

## Layout and print controls
- Default `fit: "contain"` preserves the entire illustration. Padding is intentional.
  `"cover"` fills each slot with a centred crop: manually check faces and meaningful objects.
- Important content sits at least 64 px (about 5.4 mm) from the outer edges.
- Text shrinks within bounded sizes, then fails clearly when it cannot fit. Shorten text
  rather than accepting unreadable output. No automatic hyphenation is applied.
- Pillow's embedded default font makes the demo self-contained. For Chinese or other unsupported
  scripts, set `"font": "fonts/your-licensed-font.ttf"` and use a font covering the text.
  Test the result for missing glyphs. Font shaping and complex-script support depend on the
  chosen font/Pillow build; no multilingual typography guarantee is implied.
- EXIF orientation is applied; embedded source colour profiles are converted to sRGB.
  Unprofiled input is assumed sRGB. Output metadata does not copy source GPS/EXIF.
- No bleed or crop marks are added: these are photo-print rasters, not commercial press files.
  Use actual size / 100% if printing at home; avoid page-fit scaling.
- A low-resolution source emits a warning; upscaling cannot recover detail.
- Layout is repeatable for the same inputs, Pillow build and font. Different library or font
  versions may change pixels; dependency version is pinned for repeatable environments.

## Repository
```text
src/keepsake/          CLI, validation, deterministic layout and exports
templates/            One portrait and four-memory JSON examples
assets/samples/       Safe, original geometric placeholders
scripts/              Re-create sample artwork
tests/                Dimensions, metadata, validation, crop and repeatability checks
docs/                 Workflow, upstream prompt, privacy
integrations/comfyui/ Future optional adapter boundary
.github/workflows/    Automated tests on Windows and Linux
examples/             Generated demo outputs (download archive; reproduce with CLI)
```

## Tests
```powershell
python -m unittest discover -s tests -v
```

## Publish to a new GitHub repository
Create an empty repository in your own GitHub account. From this extracted project folder:

```powershell
git init -b main
git add .
git diff --cached --stat
git commit -m "Initial keepsake card generator"
git remote add origin https://github.com/ElsaYilinWang/blessing-keepsake.git
git push -u origin main
```

The repository is public; keep personal images and secrets out of it. Inspect staged files before committing; keep real people and private configs
out of Git. The repository is https://github.com/ElsaYilinWang/blessing-keepsake (public).
The downloadable archive intentionally excludes Git metadata.

## Licence
The source repository is public by your choice. No open-source licence is offered; a proprietary notice is included. Public source can be viewed and forked under GitHub terms and must not be treated as confidential.
The included LICENSE is a placeholder notice for the project owner to finalise.
The original prototype used MIT, which permits commercial use but also grants reuse rights.
A public website does not require a public source repository. Third-party software, images and fonts
remain subject to their own terms. See [publishing guidance](docs/PUBLISHING.md).

Read [the workflow](docs/WORKFLOW.md), [upstream handoff](docs/UPSTREAM.md) and
[privacy practices](docs/PRIVACY.md) before using friends' photos.
