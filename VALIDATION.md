# Validation

Validated locally with Python 3.12.14 and Pillow 12.3.0 on Windows.

Six unittest cases passed. Portrait, four-memory, and landscape demo exports were generated and their previews visually inspected. PNG print metadata includes 300 DPI and sRGB; phone output is 1080 x 2400.

CI is configured for Windows/Linux and Python 3.10/3.13, but those remote jobs have not been run here.

Website: two Node print-metadata tests and JavaScript syntax check passed. Actual browser print PNG verified with Pillow: 1181 x 1772 px and 299.9994 DPI (PNG rounding).

Cloudflare static deployment confirmed Ready (version a02f073f). Live site loaded correctly. Live file selection, portrait/four-memory/landscape controls and permission checkbox verified. Live wallpaper download inspected: 1080 x 2400. AI generation remains manual; no API generation was tested or billed.
