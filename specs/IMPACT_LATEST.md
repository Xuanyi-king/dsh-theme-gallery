# e02: Nine themed startup intros

## Target
Extend `src/startup-intro.mjs` and the offline build from a Shanhe-only opening to ten gallery openings. Preserve the shipped Shanhe view and one-shot lifecycle.

## Dependents
- `src/client.mjs`: initializes the controller and mounts the shell overlay.
- `scripts/build-gallery.mjs`: combines source modules and CSS into lib/client.js.
- `test/startup-intro.test.mjs`: startup, restore, cancellation, focus, and reduced-motion contracts.
- `test/bundle.test.mjs`: shipped module loader and twenty-image offline bundle contract.
- `scripts/verify-startup-browser.mjs`: browser fixture currently assumes other themes bypass playback.
- Both READMEs: currently describe a Shanhe-only sample.

## Affected Stories
Historical e01s01 remains the Shanhe sample. New e02s01 adds the nine approved designs and a separate all-theme preview page.

## Contracts
Startup only, four seconds, no audio/video/network media. Built-in/invalid themes and reduced motion still bypass. Saved host selection wins; a stalled restore falls back after 1.5 seconds. User selection suppresses late autoplay. Theme changes/disposal dismiss. Keyboard focus and Skip/Escape remain supported. Theme registration, settings, host routes, standalone packages, and existing images remain unchanged.

## Risk: Medium
The common overlay now handles ten visual variants. Add per-theme lifecycle/view tests and browser checks at desktop and mobile sizes. Keep effect DOM bounded and generated deterministically.

## Test Coverage Gaps
Old non-Shanhe bypass assertions must become all-gallery playback assertions. Add distinct artwork and mobile text bounds checks. Preserve the Shanhe screenshot composition. Verify the shipped artifact, not source-only components.

## Recommended action
Implement on feat/themed-startup-intros, produce an offline theme chooser, and request visual approval before any push.
