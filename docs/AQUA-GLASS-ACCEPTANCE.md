# Aqua Glass 与全局启动动画开关验收

2026-10-15—16；基线 `main@a29fa365a9ed4aec0cc6526552c96ccc69c1dea3`，开始时工作树干净。功能分支 `feat/aqua-glass-startup-toggle`；候选版本 **0.3.23，未发布**。不合并 main，不发布 npm/Release，不修改生产 Profile。原已发布 `artifacts/xuanyi-king-dsh-theme-gallery-0.3.22.tgz` 与 README 校验和不变。

## 实现与复用

- `src/catalog.mjs` 末尾注册 `gallery-aqua-glass`，原十一款 ID、顺序、配色和资源不变；服务端选择白名单同步。`themes/aqua-glass/` 只有配色与资源，无独立 package/安装命令。
- 原创 MIT SVG 壁纸转换为本地 WebP：场景 2048×1280 / 28,340 bytes，预览 840×525 / 7,516 bytes，卡片 480×300。无 Apple 资源、远程素材、字体或新增运行依赖。构建沿用原单包流程，将十二款场景和卡片共 24 个 WebP 内嵌入 Client。
- 玻璃效果只用于侧栏与输入容器；不支持 backdrop 时为不透明底色，窄屏输入区不模糊。会话顶栏 94%、正文 97% 高不透明背景、代码不透明背景且不模糊，原生 Markdown、Shiki 高亮、复制、输入与菜单结构保留。沿用四项调节和 Windows 标题栏处理。新增 CSS 均经现有构建按主题 ID 隔离，Aqua 专属规则最后附加，不重写其他主题。
- Aqua 的 CSS/SVG 开场由现有 `shell.overlay` 承载，4 秒上限，保留恢复等待 1.5 秒、Esc、跳过、焦点恢复与 reduced-motion。使用现有轻量运行状态机制，没有新增状态观察器、轮询或播放引擎。
- `src/client.mjs` 的原主题控制器增加一个布尔偏好及订阅。主题中心「画面与文字」之后仅有一个原生 checkbox `role=switch`；独立于四滑条的 disabled fieldset，内置主题下仍可操作。中英文、Space 键和焦点样式可用，页面卸载不重置控制器。
- `src/startup-intro.mjs` 在启动决策前读取偏好，关闭立即结束并清理等待/播放计时器；再次开启不重播。React overlay 的独立 unmount cleanup 同时覆盖等待宿主和已播放状态。模型状态文案与用时不受影响。

## 配置与恢复

新增唯一键 **`dsh.themeGallery.startupIntro.enabled`**，在浏览器存储 `true`/`false` 字符串。它属于与四滑条相同的设备偏好，复用现有控制器；不改宿主 selection 文件格式，无需迁移。缺失/无效值默认开启；写入失败时会话内仍有效，但无法保证下一次浏览器会话保存成功，不将存储失败报告为恢复成功。

恢复基线 schema 仍为 1，`configuration.startupIntro` 是可选的原始存储值。正常情况下保留原值；若写入失败造成持久化值与实际内存偏好不同，导出的基线记录实际偏好。验证仍要求当前实际/持久化状态匹配，不因此误报更新成功。

旧基线缺字段表示默认开启，接受缺失/null/显式 `true`，拒绝显式 `false`；新基线逐值比较，未知配置字段继续保留/比较。手工恢复仅还原本插件 `selection.json` 原字节及三个浏览器键：选择、四项参数、启动偏好。缺失或 null 的动画字段只删除该键以恢复默认，不清空 localStorage，不覆盖 DSH_HOME/其他插件。更新模块不安装任何软件，原安全更新引导、请求取消与认证边界不变。

选择「跟随 DSH」立即释放主题覆盖。实际 Client disposer 释放 CSS、Slots、事件和路由，保留本插件持久化数据供重装；恢复旧固定版本前先完全停止宿主，保留本插件配置和基线，使用外部官方 CLI/管理器恢复原产物，再冷启动与硬刷新。旧版忽略新浏览器键，无需删除它。

## 自动化证据

| 检查 | 结果 |
| --- | --- |
| 基线 `npm test` | PASS：148 项（55 旧 workspace + 93 图库） |
| `npm run build` | PASS：单包 Client/Host/build-info/artifact 同步为 0.3.23，12 款资源 |
| `npm test` | PASS：162 项（55 旧 workspace + 107 图库），0 失败/跳过 |
| `npm run pack:gallery` | PASS：同一 scoped 包，无新安装命令/运行依赖 |
| 开场 React/Chromium 工具 | PASS：十二款，桌面/移动/320px，Esc/跳过/自动退出/reduced-motion/恢复；此工具使用模拟 DSH 服务，不冒充宿主测试 |
| 只读审查 | 修复 pending overlay 卸载、旧基线默认开启等价、主按钮 foreground 三项问题；最终审查无阻塞项 |

新增回归覆盖：十二 ID 唯一与资源有效、默认正文/输入/菜单 token 和主按钮普通/hover 对比度 ≥4.5:1、全部主题禁用开场和刷新恢复、默认开启、重新开启不重播、正在播放关闭清理、宿主延迟/超时、存储抛错、内置主题下开关可用、active/pending unmount 无计时器/订阅残留、基线携带新字段与旧格式兼容。既有取消、认证、并发、来源/锁定 commit、故障注入与原十款独立主题测试均保留。正文对比度断言针对默认不透明 token，不声称对所有用户自选对比参数/全部原生语法颜色做 WCAG 认证。

## 真实宿主验证范围

通过官方 CLI 安装本地固定候选 tgz 到仓库外临时 DSH_HOME，通过真实 Loader、Connection、主题/Slots/原生插件管理器和 Chromium 检查，不使用静态 DSH 仿制页面。

| 环境/项目 | 结果 |
| --- | --- |
| Linux / Node 24.19.0 / Chromium / DSH Web `0.2.1-alpha.2` | PASS：最终候选包的十二主题/开关/刷新/四滑条/恢复基线、原生渲染及桌面/390/320px；冷启动/恢复/原生实时停用与重新启用/卸载冷启动/重装恢复均通过 |
| Linux / Node 24.19.0 / Chromium / DSH Web `0.2.0-rc.2` | 10月15日真实 Web 通过十二主题、开关、原生渲染、390/320px、四滑条及基线；早于最终顶栏 CSS 修正，不宣称最终候选包完整复验；此前停用失败受测试 fixture 位置污染，不能算宿主验证结论 |
| Windows Desktop / 原生 WebView / 系统标题栏 | **NOT TESTED**：当前环境没有 Windows/Desktop |
| 真实外部模型输出、联网模型错误/工具调用 | **NOT TESTED**：未使用模型密钥；不冒称已测真实推理 |
| 实际不支持 backdrop-filter 的浏览器 / GPU 压力基准 | **NOT TESTED**：仅移除 Aqua 的 @supports 分组验证不透明降级，未做 GPU 基准 |
| peer 声明范围内其他 DSH 版本、registry/线上更新 | **NOT TESTED（本轮）**；不扩大兼容范围、不执行线上更新 |

[最终真实 Web 脱敏结果](screenshots/aqua-web-result.json)；[恢复/卸载/重装结果](screenshots/aqua-recovery-result.json)。两者不包含认证状态或用户配置原文。

测试环境纠正：曾直接将仓库内的测试适配器作为 Host Loader entry，DSH 按最近的图库 package.json 自动识别出第二个图库 Client 来源，使停用检查出现残留。此结果属于测试污染，不能据此判断宿主缺陷或基线回归。最终测试必须把 fixture 复制到独立 private manifest 下；fixture 现在会拒绝直接从声明 dsh.client 的包目录运行。严格停用/清理断言保留，隔离纠正后真实 alpha.2 已通过，不使用跳过选项隐藏失败。

真实聊天内容由 `test/fixtures/aqua-scripted-provider.mjs` 通过公开 LlmAdapter 在隔离宿主内生成。它只在显式测试环境变量下运行、无需密钥、从不打包；经过真实 Agent 流、原生消息/Markdown/Shiki/composer 渲染。可检查流式文字、状态用时、代码复制、长文本、列表/引用/表格、原生模型菜单；这证明 UI 集成，不代表真实模型行为验证。

真实截图（均为候选源码，测试回复有明确 scripted 标识）：

- [桌面首页](screenshots/aqua-home.png)
- [主题中心与全局开关](screenshots/aqua-center.png)
- [原生 Markdown 与代码](screenshots/aqua-markdown-code.png)
- [启动开场](screenshots/aqua-intro-desktop.png)
- [320px 对话](screenshots/aqua-chat-320.png) / [320px 主题中心](screenshots/aqua-center-320.png)
- [英文界面](screenshots/aqua-english.png)

## 独立复现方法

1. `npm ci && npm run build && npm test && npm run pack:gallery`，检查候选包 `xuanyi-king-dsh-theme-gallery-0.3.23.tgz`，不要覆盖发行包。外部目录安装所需精确版本 `@deepseek-ai/dsh@0.2.1-alpha.2`（另以 rc.2 重复），Playwright/Chromium 仅作测试工具。
2. 用新的临时 DSH_HOME，通过 `dsh plugin --profile web add <候选 tgz 绝对路径>` 安装。不要用真实用户目录、link 或生产 Profile。用 `node --expose-internals <精确 runtime 的 dsh/lib/bin.js> --profile web ...` 启动以启用官方 HMR；缺少该参数时应以原生管理器返回的 application 状态为准，不应默认即时卸载。仅在隔离测试中使用官方 browse-picker overlay 与 fixture overlay（先复制 fixture 到仓库外、有独立 name/private/type 清单且无 dsh.client 的测试目录；insert 的 name 指向该副本绝对路径），设置 `DSH_AQUA_ISOLATED=1` 和 `DSH_AQUA_TEST_RUNTIME=<外部 runtime/package.json>`。
3. 设置 `DSH_CENTER_ISOLATED=1`、`DSH_CENTER_BROWSER_TOOLS=<外部 Playwright 目录>`、`DSH_CENTER_HOST_LOG=<仅测试宿主日志>`、`DSH_CENTER_SCREENSHOTS=<私有输出目录>`、`DSH_CENTER_EXPECT_RUNTIME=<精确版本>`、`DSH_AQUA_SCRIPTED=1`，执行 `node scripts/verify-aqua-glass-host.mjs`。没有 fixture 时省略 scripted 变量，则不宣称执行聊天检查。脚本自行校验实际 active/版本/产物并操作原生 UI。
4. 输出含截图、脱敏 `result.json`、恢复基线，以及**私有** browser-state.json；后者包含认证状态，绝不提交或分享。以同一测试环境设置 `DSH_CENTER_TEST_HOME=<临时DSH_HOME>` 和 `DSH_CENTER_RECOVERY_PHASE=prepare` 运行 `scripts/verify-theme-center-recovery.mjs`，注入主题/参数变化后仅还原 owned 键和选择字节。真正停止并重新启动该测试宿主，`...PHASE=verify` 验证冷启动恢复。
5. 手工检查桌面、390px、320px 和中英文截图，默认→Aqua→其他主题往返；关闭开场再刷新/重启，确认代码复制、输入光标/占位符、菜单层级和运行用时不受影响。正式审查前仍需在独立 Windows Desktop Profile 补验，不能将 Linux Web 结果当作 Desktop 证明。

官方契约依据沿用 [生命周期审计](DSH-LIFECYCLE-AUDIT.md) 与 [升级设计](THEME-CENTER-UPGRADE-DESIGN.md)：稳定 `sidebar.panellist`/root `main` 面板、`shell.overlay`、scoped bundle 的 pluginNavigation；不引入或假定升级 API。此轮没有新增运行时网络请求、DOM 插入导航或状态观察器。风险仍主要来自上游原生 UI CSS 类名变动、Windows 渲染差异与浏览器存储权限，需按精确版本复验。
