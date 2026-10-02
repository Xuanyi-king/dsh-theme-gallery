# e02s01: Nine themed startup openings

type: feat
context: domain
risk: P1
bcps: 4
base: 51701b8

## Approval
The user approved all nine directions, then asked to continue. No push is authorized for this new batch yet.

## Requirements
- MODIFIED: Gallery startup playback. Before: only Shanhe plays. After: every valid gallery theme plays its own opening; built-in/invalid choices still bypass.
- ADDED: Ultraman uses a blue energy core and orbital arcs; Perfect World uses a gold sun/rune design; Flame Emperor uses a cyan lotus and embers.
- ADDED: Great Sage uses cloud bands and a staff light trail; Nezha uses ribbons, lotus petals and a fire wheel; Whale Prince uses tide rings, rays and bubbles.
- ADDED: A Liang uses fine rain, a warm lamp glow and a restrained sword glint; Sunny Watch uses sunrise/skyline forms; Young Goku uses nimbus clouds and gold trails.
- ADDED: Place copy in scene whitespace and preserve character visibility. Avoid strong flashing and excessive particles.
- ADDED: Provide a separate offline chooser/replay page. Its explicit replays do not change DSH startup-only policy.
- PRESERVED: Four seconds, restore fallback, user-interaction suppression, Skip/Escape, focus cleanup, reduced motion, offline assets, and Shanhe layout.

## Architecture
`createStartupIntro` owns one-shot scheduling; `createStartupIntroView` owns modal interactions. Their callers are the client plugin and verification fixtures. The new artwork renderer owns bounded vector geometry; CSS owns each theme's lighting and composition.
Reason for Depth: a single artwork interface hides nine different vector structures from the lifecycle and modal code without introducing nine plugin copies.
No new runtime dependencies. [OK] Existing external React 18/Playwright tooling remains test-only.

## Steps
1. Extend playback eligibility with tests of every theme and preserve startup boundaries. → verify: `node --test test/startup-intro.test.mjs`
2. Add distinct artwork/layouts and include them in the offline client. → verify: `npm run build && node --test test/startup-intro.test.mjs test/bundle.test.mjs`
3. Generate a chooser/replay preview, verify desktop/mobile variants, and sync guides. → verify: `DSH_INTRO_BROWSER_TOOLS=/tmp/dsh-intro-browser.zOIqKy node scripts/verify-startup-browser.mjs`
4. Check regressions, syntax, package contents, and coverage. → verify: `npm test && git diff --check`

## Human verification
Open theme-intros.html in a browser. Select and replay each theme. Confirm the character remains visible, the title is readable, and the effect is distinct. Use Skip and Escape. Compare desktop and narrow windows. Confirm Shanhe still matches the accepted sample.

## Boundaries
Browser fixtures simulate DSH services. Actual native-desktop host validation remains a separate manual check. Do not mark visual UAT or push the branch until the user accepts the batch.
