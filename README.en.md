# DSH Theme Gallery

[简体中文（默认）](README.md) | **English**

One plugin, eleven themes for DeepSeek Harness. Open the sidebar **Themes** center to choose a theme. Select **DSH default** to restore the built-in appearance. DSH restores your saved theme after a restart.

## Themes and appearance

Each theme includes a color palette, scene wallpaper, headline, and input hint. The wallpaper covers the actual conversation area. A gradient behind the text keeps messages readable.

| Theme | Preview | Style |
| --- | --- | --- |
| Mountains & Ink · 山河剑意 | [View preview](themes/shanhe/assets/concept-preview.webp) | Paper, ink landscapes, vermilion, flowing ink lines |
| Giant of Light · 光之巨人 | [View preview](themes/ultraman/assets/concept-preview.webp) | Ultraman-inspired red and silver, stars, blue energy |
| Immortal Emperor · 荒天帝意象 | [View preview](themes/perfect-world/assets/concept-preview.webp) | Perfect World-inspired black and gold armor, red cape, celestial palaces |
| Flame Emperor · 炎帝意象 | [View preview](themes/flame-emperor/assets/concept-preview.webp) | Battle Through the Heavens-inspired black robes, heavy blade, cyan fire lotus, volcanoes |
| Great Sage · 齐天大圣 | [View preview](themes/great-sage/assets/concept-preview.webp) | Golden eyes, staff, clouds, celestial palaces |
| Nezha · 哪吒 · 莲身破浪 | [View preview](themes/nezha/assets/concept-preview.webp) | Red ribbon, ring, spear, fire wheels, lotus and waves |
| Whale Prince · 鲸少 · 沧海之主 | [View preview](themes/whale-prince/assets/concept-preview.webp) | Ocean guardian, giant whale, deep-sea kingdom |
| A Liang · Rain Road · 阿良 · 雨夜行 | [View preview](themes/jianlai-aliang/assets/concept-preview.webp) | Traveler, bamboo hat, rainy night, warm lamps, sword light |
| Sunny Watch · 晴空守望 | [View preview](themes/sunny-watch/assets/concept-preview.webp) | Morning city, clear sky, warm sunlight |
| Young Goku · Nimbus Journey · 少年悟空 | [View preview](themes/young-goku/assets/concept-preview.webp) | Young Goku, Flying Nimbus, Power Pole, bright landscapes. Unofficial fan theme. |
| Wang Lin · Renegade Immortal · 王林 | [View preview](themes/wang-lin/assets/concept-preview.webp) | Silver-white hair and robes, slate mountain mist, cinnabar accents, a split red/silver seal. Unofficial Renegade Immortal fan theme. |

The plugin uses newly made visual assets. Character themes are unofficial fan designs. New artwork does not mean original ownership of the characters or permission from their rights holders.

Four sliders adjust the appearance across all eleven themes:

| Control | Default | Effect |
| --- | --- | --- |
| Background depth | 0% | Adjusts the color mask over the conversation wallpaper |
| Sidebar mask | 40% | Adjusts the color mask over the sidebar wallpaper |
| Scene blur | 0 px | Adjusts wallpaper blur |
| Text contrast | 100% | Adjusts text contrast |

Slider changes take effect immediately and remain on the current device after a restart. These controls do not change built-in DSH themes. The theme center uses its own translucent background.

During a model response, each theme shows its own text, elapsed time, and small animated mark in the native status area. The plugin supports the separate DSH 0.2 status row. With reduced motion enabled, the mark stays still.

Version 0.3.18 fixed duplicate native whale effects and theme marks on DSH 0.2.0-rc.2. It also fixed old startup colors that overrode the saved theme and made text black. The compact status row keeps its text and timer clear.

Version 0.3.19 fixed A Liang, Sunny Watch, and Young Goku being rejected by the Host and falling back to an older theme after a restart. All ten themes now hide the home "preview" badge and keep the same native layout and controls; all ten also play a startup intro with their own palette, artwork, and copy (Shanhe keeps its ink sample, the other nine use dedicated vector scenes).

On Windows desktop, the title bar uses a solid theme color. The sidebar wallpaper and mask remain adjustable. The plugin styles the existing sidebar, conversation, and input card without replacing their functional buttons.

Shanhe uses a WebP ink landscape instead of the older abstract SVG mountains.

Version 0.3.20 adds **Wang Lin · Renegade Immortal**, with silver-white robes, slate mountain mist, and restrained cinnabar accents. The native home, sidebar, title bar, composer, and running status share the palette. Active replies retain their timer beside a softly breathing red/silver seal; the startup intro reveals the seal through mist. It uses the same four sliders and the existing single installation.

## Installation

### Desktop app

The plugin is published to npm as `@xuanyi-king/dsh-theme-gallery`.

1. Open **Plugins → Add plugin** in DSH.
2. Paste this package name into the input field:

```text
@xuanyi-king/dsh-theme-gallery
```

3. Select **Install**.
4. Open the sidebar **Themes** center.
5. Select a theme card.

### Web profile

Run:

```bash
dsh plugin --profile web add @xuanyi-king/dsh-theme-gallery
```

> Do not install from the GitHub repository address. A `https://github.com/...` or `github:` spec makes pnpm clone the entire git history (this repository's snapshot is about 21MB), and DSH runs a GitHub reachability pre-check first (5s default timeout) that fails outright as `spec-host` on GitHub-restricted networks. The npm spec needs one registry metadata request.

> Before 0.3.21 the published name was `dsh-theme-gallery` (installed from the GitHub address). The name changed to avoid an unrelated npm package that already owned it. Remove the old `dsh-theme-gallery` dependency before installing the new name, or two bundles will insert the same plugin.

Then open the sidebar **Themes** center. One installation includes all eleven themes.

After an upgrade, close and reopen DSH to load the new plugin. DSH restores your saved theme. If older standalone theme plugins remain installed, remove them to prevent competing styles.

## v0.3.21: dedicated theme center and safe updates

Select **Themes** below **Plugins** in the sidebar. The native panel supports its collapsed palette icon, keyboard navigation and Chinese/English labels. Closing the page keeps the theme active. The old `settings.section` contribution is removed; `shell.overlay` startup intros remain.

The top panel separates the running Client version, disk manifest, installation source, reliable locked commit, build fingerprint, DSH/Node and remote target. A single nonblocking startup check is read-only; nothing installs automatically. Checks prefer verified stable GitHub Releases, otherwise fetch the default branch commit and its pinned manifest/bundle from the fixed official repository. README text is never a version source. Network failures, proxy issues, rate limits, timeouts, older remote data or historical artifacts without metadata remain failed/unknown.

| DSH | v0.3.21 support |
| --- | --- |
| `0.2.1-alpha.1` | Primary target, pinned official tag; actual Web evidence in acceptance record |
| `0.2.0-rc.2` | Regression target with the same main/sidebar/Connection contract |
| Other `0.2.x`, prereleases included | Peer range `>=0.2.0-0 <0.3.0` matches automatically on the same main/sidebar/Connection contract |
| `0.1.x` and `>=0.3.0` | Unverified; do not widen peers or force an incompatible install |

Node requires `^22.19.0 || >=24`. The DSH peer is `>=0.2.0-0 <0.3.0`: the floor is written `0.2.0-0` rather than `0.2.0` so prereleases such as `0.2.0-rc.2` and `0.2.1-alpha.1` stay matchable under SemVer, while the `0.3.0` ceiling prevents a cross-major install. The same range is declared in `engines.dsh` so the plugin catalog can predict compatibility before installing.

| Installation source | Supported detection/guidance |
| --- | --- |
| Official GitHub repository | Dependency spec and locked commit checked separately; unknown/stale lock explained, target pinned |
| Registry / local `.tgz` | Manifest, running build and artifacts checked; native-manager guidance |
| `link:` / junction / local directory | Read-only identification and backup; update the source without moving/deleting it |
| Unproven source / custom Host | Unknown/unsupported; no generic installation command |

**Check compatibility** reports DSH/Node, every DSH peer with real SemVer/prerelease matching, target artifacts, disk/runtime agreement, writable target, a single active entry and a recovery path. Incompatibility blocks updates. The official Host has no full safe upgrade transaction; even a compatible target only offers **Save recovery baseline → Download baseline → Open DSH plugin details**. This plugin never runs npm/pnpm installers, chains uninstall/install, upgrades DSH or modifies other plugins.


**Verify running state again** reads the saved baseline after restart and checks disk/Host/Client, active state, registrations, actual image decoding, theme and sliders against the original configuration. Missing evidence remains unknown. Baseline IDs persist in the browser; backups reject linked boundaries outside this plugin and preserve original bytes and unknown fields.

### Manual updates and recovery

1. Save and download the baseline. The only Host backup is `dsh-theme-gallery/update-baselines/<unique ID>.json`. Record the original fixed artifact, source, locked commit and Profile. The baseline retains original `selection.json` bytes (including unknown fields), browser theme copy and all four sliders; it never copies DSH_HOME.
2. From an independent terminal or external Agent inspect `dsh --version`, Node, installation type and target peers. Confirm a recoverable original artifact before uninstalling. Use the official manager or the matching installation mechanism for this plugin only. GitHub installs may retain an old lock commit; verify the resolved result rather than deleting the whole lockfile or updating every dependency.
3. On Windows fully stop DSH to release file locks; closing the browser is insufficient. Never install from the plugin/DSH session being replaced. A link/junction is the source itself: never blindly copy into, move or remove it.
4. Restart the Host and hard-refresh the browser. Verify running Client/Host/manifest, locked commit, active status, navigation, resources, theme and sliders. Downloaded, installed and activated are separate stages. Inspect unknown outcomes before retrying.
5. Download failures leave the original intact. After install failures reinstall the recorded original fixed artifact externally. Recover Host load failures externally; for client failures check the actual bundle/cache then refresh. Restore only baseline `selectionRaw` to this plugin’s `selection.json` at its original path, keeping the backup. Restore only browser keys `dsh.themeGallery.selection` and `dsh.themeGallery.visual` (remove a key when null); never clear all storage or other plugin settings.

See [design evidence](docs/THEME-CENTER-UPGRADE-DESIGN.md) and [acceptance record](docs/THEME-CENTER-ACCEPTANCE.md) for fault injection, actual Host evidence and Windows limitations.

## Theme selection and storage

the sidebar **Themes** center includes eleven gallery themes and three built-in choices: **DSH default**, **DSH Light**, and **DSH Dark**.

Select **DSH default** to remove the gallery override. You can select a gallery theme again at any time.

The plugin saves the selection in `dsh-theme-gallery/selection.json` inside the local DSH configuration directory. The browser also keeps a local copy for hosts without the selection endpoint. DSH reads the saved selection after a restart.

## Theme startup intros

Each saved gallery theme displays its own opening for about 4 seconds after a page restart or refresh. All eleven openings use existing wallpapers and code animation. They need no video, audio, or remote media. Shanhe retains the accepted ink-style sample.

| Theme | Opening effect |
| --- | --- |
| Mountains & Ink | Ink lines, a vermilion seal, and theme text |
| Giant of Light | A blue energy core and slow orbital arcs |
| Immortal Emperor | A gold sun ring, rune marks, and a central star |
| Flame Emperor | A cyan fire lotus and warm rising embers |
| Great Sage | Cloud bands and a golden staff trail |
| Nezha | Red ribbons, lotus petals, and a fire wheel |
| Whale Prince | Deep-sea rays, tide rings, and rising bubbles |
| A Liang | Fine rain, a warm lamp glow, and a brief sword glint |
| Sunny Watch | Sunrise light, a sun symbol, and a city outline |
| Young Goku | Light cloud trails, gold arcs, and bright theme text |
| Wang Lin | Slate mist, a split red/silver seal, and resolute theme copy |

Desktop layouts place the text in the scene whitespace on the left. Narrow layouts place the text near the bottom. The wallpaper crop helps keep character faces visible.

Select **Skip** at the top right, or press **Esc**, to close the opening immediately. The opening plays once per page startup. Theme changes and new conversations do not replay it.

With a built-in DSH theme or system reduced motion enabled, the plugin skips the opening.

Before playback, the plugin waits for the saved theme to restore. If the host request remains incomplete after 1.5 seconds, the plugin uses the local selection. A later response does not reopen the intro. A manual theme selection during startup also suppresses delayed playback.

## Development and verification

Run from the repository root:

```bash
npm run build
npm test
npm run pack:gallery
```

The root package contains the combined gallery. `themes/<name>/` retains theme resources. Wang Lin supplies only palette and assets for the gallery, with no standalone manifest or package. The ten legacy themes retain their original resources and tests. The startup intros apply only to the combined gallery. It does not change standalone theme packages.

### Optional browser verification

The browser script uses real React and the built `lib/client.js`. It covers all eleven themes at desktop, mobile, and 320px widths. It also covers Skip, Esc, automatic dismissal, reduced motion, and theme restoration.

1. Install `playwright`, `react@18`, and `react-dom@18` in a directory outside this repository.
2. Install Chromium through Playwright.
3. Run:

```bash
DSH_INTRO_BROWSER_TOOLS=/path/to/browser-tools node scripts/verify-startup-browser.mjs
```

The script saves screenshots and offline previews in `/tmp/dsh-theme-intros-preview/` by default.

1. Open `theme-intros.html` in a browser.
2. Select a theme from the menu or a theme card.
3. After the opening ends, select the replay button to view it again.

The preview keeps its theme selection in memory. It does not read or change existing browser settings. Theme selection and replay apply only to this preview, not to the installed plugin. The script also retains `shanhe-preview.html`.

Set `DSH_INTRO_BROWSER_EXECUTABLE` to an already installed Chromium-based browser executable, such as Microsoft Edge on Windows, to skip the Playwright Chromium download.

The browser fixture simulates DSH services. It does not replace verification inside the actual DSH app.

## License and character rights

The code uses the MIT license. See [LICENSE](LICENSE).

Character themes are unofficial fan designs without a claim of official permission. Character rights and related intellectual property remain with their respective owners.
