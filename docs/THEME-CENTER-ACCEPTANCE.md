# Theme Center v0.3.21 验收记录

2026-10-08。主要目标为官方 `dsh-v0.2.1-alpha.1`，固定源码 `5badb15009ae1756c3afe0ae0cef1faafc290ccc`；旧版回归为 `0.2.0-rc.2`（完成全功能 Web 回归及最终 tarball 加载 smoke）。开发基线 main `deb3c0b415c9f101694cb32d033b21ac0c6bf987` / v0.3.20，工作区起始干净，无 AGENTS.md。开发分支 `feat/theme-center-safe-updater`，未合并；交付为本地提交，不推送 main、Release 或 npm。

**仓库实现、自动测试及真实 Linux Web 验收通过；真实 Windows/Desktop 验收阻塞。因此不能宣布全部平台验收完成。** 没有更改生产 DSH 安装，没有升级既有宿主。所有真实安装、停用/启用、重启和恢复演练都在 `/tmp/dsh-theme-center-*` 隔离 Profile 中。

## 文件与实现

| 文件 | 结果 |
| --- | --- |
| `src/client.mjs` | 原生 `sidebar.panellist` order 5 与 root keyed `main`，统一 ID `dsh-theme-gallery`，Palette SVG；移除 settings.section；保留插件级主题生命周期与 shell.overlay。 |
| `src/update-client.mjs` | 插件级更新控制器、中文/英文透明面板、状态/超时/取消/去重、备份下载、兼容预检、官方详情导航和运行核验。 |
| `lib/update-core.js`、`lib/update-host.js` | 固定仓库检查、安装身份、SemVer/prerelease、全产物哈希、限定配置基线、卸载响应保护；通过 authenticated Connection API；无安装执行器。 |
| `lib/index.js`、`lib/selection-route.js` | 接入 Host 更新模块；原选择持久化路由增加官方 Connection admission，保持原主题允许 ID。 |
| `scripts/build-gallery.mjs`、`lib/client.js`、`lib/build-info.js`、`lib/artifact.json` | v0.3.21 manifest/Host/Client 一致；运行构建与磁盘分离；包含原 11 款主题的 22 个 WebP。 |
| `package.json`、`package-lock.json` | 统一包 0.3.21；固定 semver/js-yaml；显式 optional Host peer 为 rc.2/alpha.1，不强行安装宿主。 |
| `test/update*.test.mjs`、`test/bundle.test.mjs`、`test/host.test.mjs` | 更新模块、真实 HTTP 故障注入、导航/生命周期/身份/权限与原功能回归；未删减原行为断言。 |
| `scripts/verify-theme-center-host.mjs`、`scripts/verify-theme-center-recovery.mjs` | 可重复的真实隔离 Web 与恢复验收；外置浏览器工具，不进入插件包。 |
| `scripts/verify-startup-browser.mjs`、`scripts/intro-preview.mjs` | 旧启动开场浏览器 fixture 改用新 main，保持原断言。 |
| `README.md`、`README.en.md`、设计文档 | 新入口、来源、版本矩阵、限制、Windows 注意事项、人工恢复与 API 证据。 |

未增加第二个主题安装包或独立安装命令。旧主题 workspace 资源与测试保留，王林仍仅在统一包内。

## API 与能力边界

完整证据见 [设计文档](THEME-CENTER-UPGRADE-DESIGN.md)，均以 alpha.1 tag 实现为准，未拿旧 Skill 卡片代替当前源码：

- [sidebar slots](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/client/ui-sidebar/src/client/contract/slots.ts) 和 [SidebarRoot](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/client/ui-sidebar/src/client/SidebarRoot.tsx)：原生 list 导航、折叠、键盘与 aria。
- [layout service](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/client/ui-layout/src/client/service.ts)：root `main` / `selectPanel`。
- [plugin manager Client](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/client/ui-plugin-manager/src/client/index.ts)：`pluginNavigation.openBundle()` 及原生插件 order 0。
- [Host plugin manager](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/boot/plugin-manager/src/index.ts)：可安装/卸载/启用和追踪安装，**没有完整升级事务或独立可恢复的原版本回滚**。本插件不前端串联 uninstall/install。
- [compatibility](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/boot/app-boot/src/plugin-compatibility.ts) 与 [Connection](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/client/connection/src/index.ts)：真实加载版本、includePrerelease 与 authenticated API。

来源识别支持官方 GitHub、registry、tarball、link/junction、本地目录和 unknown；仅在实际加载路径与 Profile 解析路径一致时采用其依赖/锁信息。真实宿主安装验证为本地根 tarball；GitHub/registry/链接主要为单元与真实临时文件系统证据，未冒充真实升级事务。

所有安装类型均不自动更新，因宿主缺少安全事务；链接源、版本未知、权限/兼容不满足尤其不能执行。正常流程为「检查更新 → 查看兼容性 → 保存/下载基线 → 打开 DSH 原生插件详情」，随后在外部按来源确认操作，仅更新此插件。

## 构建、测试、打包与故障证据

基线 `npm run build && npm test` 退出 0，共 **112** 项，无既有失败。最终执行 `npm run build && npm test && npm run pack:gallery`：三个命令均退出 0，共 **143** 项（旧主题 workspace 55 + 根目录 88），fail/skipped/cancelled 均为 0。统一 tarball `dsh-theme-gallery-0.3.21.tgz`。从 tarball 解出 manifest、Host/Client/metadata/patch 重新校验，版本与 SHA256 一致；测试安装经官方 CLI 解析出同一 manifest 和 active 入口。

更新模块及路由 **28** 项，另有 **1** 项真实 HTTP 集成；覆盖：正式 Release/default branch commit；已有最新、发现更新未确认；断网/403/429/超时；旧 Git 锁；同版本不同 bundle；磁盘/Host/Client 错配；缺 patch/Host/元数据/错误模块 ID/哈希；真实 SemVer（`^0.2.1` 不接纳 alpha.1）；重复入口/不可写；内部源码链接和不同加载目录；Windows 跨盘路径语义；并发、取消、插件卸载、卸载发生在读取基线途中；新检查清旧预检；后台检查时 info 仍可读取；基线跨链接拒绝；无真实基线不报成功；原选择字节与四滑条必须匹配。

真实 HTTP 集成故障注入对 check 抛出断网，同时访问不存在的 install/upgrade/uninstall 路由，确认 502/404/卸载后 503，未修改安装文件、原主题选择和其他插件文件。不是模拟成功的 npm/pnpm 安装器，也没有执行失败升级来破坏宿主。下载/安装/加载失败的人工恢复分类有测试及说明；**没有自动安装回滚能力，也未宣称真实安装失败事务回滚通过**。

恢复浏览器会话时，先等待开场自动结束再处理宿主模型引导，避免原生模态遮罩拦截开场 Skip。开场 Skip/Esc 的功能单独由完整浏览器 fixture 验证。

原生停用/启用验收曾因测试在 Host 状态尚未回写时再次点击而超时，强化为等待开关 aria-checked 确认后再执行下一步，未弱化断言。浏览器工具未自带下载的 Chromium 时，显式使用已安装的 /usr/bin/chromium。

独立审查发现的“同 commit 伪最新”“未读基线伪成功”“链接写越界”“卸载后成功”“跨盘链接误判”等问题均补回归并修正。最终限定复查未发现新的重大缺陷。

## 真实运行验收

环境：Linux、Node 24.19.0、Chromium、真实官方 npm 运行时与固定版本，headless 浏览器；使用官方 in-page-picker 测试 overlay。没有 API key，不发起模型请求。回复状态文案/轻动画通过原功能单元与真实 React fixture，未宣称真实付费模型回复 E2E。

| 验收项 | alpha.1 真实 Web | rc.2 真实 Web |
| --- | --- | --- |
| 冷启动、唯一 active、运行版本/来源、全产物校验、API 无鉴权拒绝 | 通过 | 通过 |
| 插件下方唯一主题入口、14 卡、11 主题即时切换、关闭主题页保留外观 | 通过 | 通过 |
| 四滑条即时效果/浏览器持久化、DSH 默认恢复 | 通过 | 通过 |
| 原生折叠、键盘 Enter、aria-current、中英文 | 通过 | 通过 |
| 390px/320px 无 document 横向溢出 | 通过 | 通过 |
| 原生详情导航、检查/预检/备份下载/运行核验入口、零 pageerror | 通过 | 通过 |
| 原生停用释放 route/style/nav，启用恢复唯一入口 | 通过 | 未单独执行此项 |
| 硬刷新恢复主题及四滑条 | 通过 | 通过 |
| 完全停止并冷重启，人工恢复本插件原配置字节及四滑条 | 通过 | 未单独执行此项 |
| 真实 Windows Desktop/WebView/原生文件占用和 junction | **阻塞** | **阻塞** |

原生 alpha.1 自动任务入口保持原样；主题在「插件」之后，未改变原插件/工作区的导航处理。没有伪元素/MutationObserver/DOM 插入导航，原回复文本的观察器仅保留既有用途。

恢复演练先导出基线，真实修改为山河及不同滑条，再只还原本插件 selection.json 原字节和两个浏览器键，保留备份；完全停止测试 Host 后重新启动，确认王林、四滑条、active 与唯一导航恢复。更新路由本身从不动安装目录。额外临时文件系统/HTTP 测试核对其他插件字节未变。

远端官方 main 此时为 0.3.20，没有新 BUILD_INFO，页面准确展示远端声明版本与 commit 并报告未知/远端落后；本地 0.3.21 未发布，不伪称已经最新版或更新成功。

截图：[主题与四滑条](screenshots/theme-center-desktop.png)、[版本与更新](screenshots/theme-center-updates.png)、[390px](screenshots/theme-center-390.png)、[320px](screenshots/theme-center-320.png)、[English](screenshots/theme-center-english.png)。截图均来自真实 DSH Web，无合成；不是 Windows 桌面截图。

## 可执行复现

先在独立目录安装**固定** DSH 运行时，使用新的独立 DSH_HOME，以官方 CLI 安装本次根 tarball（安装语法仍为原统一包；不运行到生产 Profile）。启动 Web 时加官方 `apps/web/tests/pin-browse-picker.overlay.yml`，为浏览器验收固定 Linux 工作区路径。然后使用外置包含 Playwright 的工具目录：

```bash
DSH_CENTER_BROWSER_TOOLS=/tmp/dsh-browser-tools \
DSH_CENTER_HOST_LOG=/tmp/theme-center-test-host.log \
DSH_CENTER_TEST_HOME=/tmp/dsh-theme-center-test-profile \
DSH_CENTER_SCREENSHOTS=/tmp/dsh-theme-center-test-results \
DSH_CENTER_ISOLATED=1 node scripts/verify-theme-center-host.mjs
```

脚本从 Host log 内部读取本地鉴权 URL，不输出 token。需要 `/usr/bin/chromium`（可用 DSH_CENTER_CHROMIUM 覆盖）和现存的隔离 Host；默认期待 alpha.1，rc.2 回归加 `DSH_CENTER_EXPECT_RUNTIME=0.2.0-rc.2`。测试输出浏览器 storageState 含 cookie，只留临时目录，不提交。恢复演练用相同变量，运行 `DSH_CENTER_RECOVERY_PHASE=prepare node scripts/verify-theme-center-recovery.mjs`；从外部停止并冷启动**同一测试 Host**，再运行 phase=verify。不得对生产 Profile 执行。

原开场验收：`DSH_INTRO_BROWSER_TOOLS=/tmp/dsh-browser-tools DSH_INTRO_BROWSER_EXECUTABLE=/usr/bin/chromium node scripts/verify-startup-browser.mjs`。真实 React fixture 覆盖全部 11 款桌面/窄屏/320px/短横屏、Skip/Esc、减少动态、focus、默认绕过、卸载清理和原生形状回复状态；此项与真实 Host 测试分别记录。

Windows 补验：在独立 alpha.1 Desktop 测试配置安装同一已验证 tarball，完全退出并重启，重复表中导航/键盘/中英文/主题/滑条/详情/停用/恢复检查；检查实际 WebView 和跨盘 junction、文件占用。当前机器不是 Windows，路径单元测试与 data-windows-titlebar CSS 只证明分支，不能替代这项。

## 剩余限制与下一步

必须补真实 Windows Desktop 验收后才能说全部验收完成。安全自动升级等待官方提供生命周期独立、可追踪、有明确回滚路径的升级事务；当前降级已交付。其他 DSH 版本没有充分证据，不能扩大 peer 范围。网络检查依赖 GitHub 可达，失败为 failed/unknown，不影响主题选择。未发表版本在远端不可核验时保持未知；发布属于本次授权之外。
