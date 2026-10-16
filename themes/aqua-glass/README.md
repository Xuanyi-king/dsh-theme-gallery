# 琉璃 · Aqua Glass

Unified-gallery-only theme: `gallery-aqua-glass`. No separate package or install command.

`assets/wallpaper.svg` is original artwork authored for this project under its MIT license, not an Apple wallpaper. Its silver-blue curves are rendered locally into `aqua-glass.webp` (2048×1280) and `concept-preview.webp` (840×525). `assets/gallery/aqua-glass.webp` at the repository root is the 480×300 card crop. All are bundled locally; no runtime download.

To regenerate with external development tooling, render the SVG with Sharp, resize with `fit: 'cover'`, and encode WebP at the dimensions above with a visually checked quality setting. Sharp is not a plugin dependency. The SVG remains the editable source of truth.

Only the sidebar and composer use backdrop filtering. Opaque fallbacks, a 97% reading plane and native syntax tokens protect text; narrow composers use the opaque fallback. All selectors are scoped during the existing gallery build.
