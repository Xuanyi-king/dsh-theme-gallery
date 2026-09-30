# e01s01: Shanhe startup intro

type: feat
context: domain
risk: P1
bcps: 3

## Purpose
Turn the existing Shanhe wallpaper into a four-second startup opening. The user approved Shanhe first, image-and-code animation, startup-only playback, Skip/Escape, and reduced-motion support.

## Requirements
- ADDED: Wait for host selection restoration; if it stalls, decide using the local selection after 1.5 seconds. Never reopen after that decision.
- ADDED: Play only for `gallery-shanhe`; never for built-in or other gallery themes.
- ADDED: Show a scene push-in, ink-line reveal, vermilion seal, and existing headline/tagline. No audio or video.
- ADDED: Dismiss after 4 seconds, Skip, Escape, theme changes, or plugin disposal.
- ADDED: Skip the opening when reduced motion is requested.
- ADDED: Keep README.md in Chinese by default, provide a linked README.en.md with matching usage instructions, and include both guides in the package. The user requested this before merging.

## Design and contracts
`applyGallery` remains the owner of selection and persistence; add `whenReady()` to expose completion of its existing asynchronous restore and `hasUserSelection()` to suppress late openings after user interaction. Existing callers and return methods remain compatible.
A small startup controller owns the one-shot decision and bounded timers. Reason for Depth: it hides restore races and cancellation from the view and makes all startup outcomes independently testable with a fake clock.
A React view lives in the existing `shell.overlay` list slot; no new static service dependency is required. It uses the existing `--dsh-gallery-scene` variable rather than embedding a second image.
The build script includes the new module and stylesheet in the shipped offline client.
No runtime dependencies proposed. Browser verification tooling, if needed, remains outside the repository.

## Steps

Base: `9e6dc95`. Requirements and first-sample choice were approved in the conversation.
1. Implement restored-selection readiness and one-shot lifecycle with controller tests. → verify: `node --test test/startup-intro.test.mjs test/gallery.test.mjs`
2. Add the accessible view, theme visuals, and shipped-bundle integration. → verify: `npm run build && node --test test/startup-intro.test.mjs test/bundle.test.mjs`
3. Validate regressions and browser behavior. → verify: `npm test && git diff --check`

## Manual verification
1. Install the locally packed gallery in a DSH test profile; choose Shanhe and restart.
2. Confirm the opening shows Shanhe artwork, seal, ink lines, and readable copy, then closes after about four seconds.
3. Restart and use Skip; restart again and press Escape. Confirm the chat remains usable.
4. Choose another theme or DSH default and restart: no opening.
5. Enable the system reduced-motion setting and restart Shanhe: no opening.
6. Switch themes/open conversations during normal use: no replay.

## Out of scope
Other nine openings, standalone theme openings, video files, settings redesign, manual preview controls, publishing, and pushing.

## Risks
Real DSH slot layout must still be checked in the actual host. A browser fixture proves view behavior but cannot prove host integration.
