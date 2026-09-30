# Shanhe startup intro impact

## Target
Add a startup-only Shanhe image animation to the unified gallery plugin.

## Dependents
- `src/client.mjs`: `applyGallery` restores theme selection; `apply` mounts the settings UI.
- `scripts/build-gallery.mjs`: bundles client source and embeds the existing scenes offline.
- `test/gallery.test.mjs`: controller persistence, palette restoration, and settings contracts.
- `test/bundle.test.mjs`: exercises the shipped module loader factory.

## Affected Stories
New e01s01 only. No prior specs, release plan, or conventions exist in this repository.

## Contracts
Keep theme registration, persistence, host routes, sliders, and standalone packages unchanged.
Do not add session services or any media routes. Do not duplicate embedded image bytes.
Keep settings registration compatible; the new overlay uses a separate `shell.overlay` list slot.

## Test Coverage
Existing tests cover the controller and shipped bundle. New coverage must prove startup waits for restore, plays only once for Shanhe, skips other themes and reduced motion, ends after 4 seconds, cancels on skip/theme change/disposal, and tolerates stalled restore.

## Risk: Medium
A startup overlay can obstruct the application or show the wrong restored theme. Use bounded timers, explicit cleanup, keyboard dismissal, and tests of the built artifact.

## Recommended action
Proceed with the user-approved Shanhe sample. Test the controller first and visually inspect a browser fixture before requesting real DSH verification.
