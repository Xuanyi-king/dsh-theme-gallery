# DSH 生命周期审计（2026-10-14）

版本 **0.3.22**；包名 `@xuanyi-king/dsh-theme-gallery`，基线 main `3ea5838`，开始时无打开的 PR。保留主题设计、十款独立主题源码、十一款统一主题、四项外观参数、现有更新预检与恢复基线；不加自动升级器、不发布。

## 官方依据与验证版本

最新官方 Release [0.2.1-alpha.2](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-alpha.2) commit `d743267388641bc76f17c45ce8b4c231aed1d32c`；npm alpha 同版，latest/next 为 **0.2.0-rc.2**。两版均在 Linux / Node24.19.0 以真实 CLI、Web、Chromium 执行生命周期。声明 `>=0.2.0-0 <0.3.0` 内其余版本 **NOT TESTED**；本轮不扩 peer。

源码依据：对应 tag 的 `packages/client/connection/src/rpc-host.ts`（认证/Fetch registry）、`packages/client/ui-plugin-manager/src/client/index.ts:41,134`（openBundle 接收 npm 包名）、`packages/boot/plugin-manager/src/index.ts:645`（原生 unload/remove）、Client theme/slots/locale 注册 API。参考六项指定升级 Skill（oh-my-dsh/dsh-plugin-upgrade-skill `ef075767b476e8000c716a18f848028eebcd5aef`），只采用审计方法。

## 安装、升级、卸载与数据

原生单 Bundle：manifest/patch/Client loader id 均为 scoped 包名；Host 的稳定插件名和 row id 仍是 `dsh-theme-gallery`，二者职责不同，无需重命名数据。正式建议 `@xuanyi-king/dsh-theme-gallery@<经验证版本>` 或版本固定 tgz；源码安装前 `npm ci && npm run build`，打包 `npm pack --ignore-scripts --workspaces=false`。无 install-time prepare；git 未构建目录不是可靠安装产物。npm/GitHub/远程tarball下载、Windows和真实Desktop安装本轮 **NOT TESTED**，本地tgz/Web已验证。

升级使用现有检查更新→兼容预检→保存基线→外部停止宿主/原生管理器处理**此包**→重启Host/硬刷新→运行Host/Client/manifest/fingerprint/lock比对。当前宿主没有安全独立全局升级事务，自动安装继续禁用。link/junction 不向未确认目标复制、移动或清理；回滚只恢复本插件固定产物、selection原字节与两个浏览器键，保留未知字段和备份。

普通卸载通过官方 Bundle remove（无 HMR 的运行宿主须先停止）。Host Connection/HTTP routes 和 Client theme registry/Slots/locale、MutationObserver、CSS、DOM装饰、启动动画/键盘事件、订阅与请求由 Cordis/已有 disposer 释放。本轮补齐选择请求取消；不新增卸载器。持久化保留 `$DSH_HOME/dsh-theme-gallery/selection.json`、更新恢复基线目录（见 `lib/update-core.js:143`）和浏览器 `dsh.themeGallery.selection`、`dsh.themeGallery.visual`、`dsh.themeGallery.updateBaseline`。不会清空原生主题配置、整个localStorage、会话或其他插件数据。

历史包名迁移：先备份上述选择/外观参数及原固定产物，停止 Host，原生 remove **旧未 scoped 的 dsh-theme-gallery**，再 add 新 scoped 固定包；不要同时保留两个 Bundle。只移除包/注册，不删除 selection.json 或浏览器键。独立旧主题与图库会同时操作装饰，使用图库前移除其旧独立 Bundle，不删除用户主题数据/历史源码。没有在本轮操作用户 Profile 或虚构自动迁移测试。

## 发现与修复

| 等级 | 文件/位置 | 复现 | 修复依据/结果 |
| --- | --- | --- | --- |
| P2 | `src/client.mjs:244,285,372` | 选择主题后立即dispose，原GET/PUT无signal，排队PUT仍发出 | per-mount AbortController；dispose取消活跃请求并跳过排队写；本地选择和外观键保留；已有架构不变 |
| P2 | `lib/selection-route.js:76` | 注入依赖退出后父作用域effect仍持有旧选择route，重新注入有重复注册风险 | effect归属获取webServer/Connection的host作用域；注销所有权回归先失败后通过 |
| P1 | `src/client.mjs:498` | scoped安装后“打开 DSH 插件详情”传旧包名，实际回到列表而非该包详情 | 官方 openBundle 参数为 packageName，改一个调用为 scoped名；产物行为测试先失败后通过，真实新版/rc2页面详情通过 |
| P2（迁移边界） | `cordis.patch.yml:2`、`lib/update-core.js:10` | 新旧依赖共存或十款旧独立主题仍活动会争夺同一row/DOM | 当前 manifest/patch/Client一致；仅补明确迁移说明，不自动删除旧依赖/选择数据 |

重新构建同步 `lib/client.js`、`lib/artifact.json` 与 `lib/build-info.js`。版本仍为0.3.22；审计工作树 build 的 sourceDirty 为 true，不冒称干净正式发布。现有源码/磁盘fingerprint验证、版本识别、manual guidance、baseline检查均保留。

## 七类风险扫描

| 类别 | 结论 |
| --- | --- |
| 源码补丁/monkey patch | 无Core补丁、替代Plugin Manager或内部自动全局升级 |
| 内部事件 | 使用公开theme/change、connection/reset；原有订阅退出可释放 |
| 服务/Remote | 官方Connection auth/Fetch、profileContext、pluginManager、Client theme/slots/layout/sidebar/locale |
| 路径 | owned selection/baseline、当前安装manifest/lock只读检查；已有symlink边界与备份校验保留 |
| UI注册 | scoped loader id/patch包名一致；稳定Panel/Theme IDs保留；Slots/native navigation已真实挂载 |
| 通道/DOM/CSS | 选择路由认证、更新Connection Fetch；取消更新与选择请求；现有DOM class/运行文本匹配仍有上游UI变更风险 |
| 子进程/输出 | 不自行spawn安装/升级命令；主构建打包为开发脚本，无新增运行依赖 |

## 测试与发布建议

| 项目 | 结果 |
| --- | --- |
| 基线与最终 `npm ci / npm run build / npm test` | **PASS**：图库根测试90→93，十个独立workspace原有测试均通过；三项新增回归先失败后通过 |
| 两个精确DSH的tgz安装/冷启动 | **PASS**：真实Web Cookie入场，scoped Bundle唯一active；Host磁盘版本0.3.22和artifact验证一致，Client无page error |
| 最小主题/UI功能 | **PASS**：山河→王林即时切换、原生主题详情打开、选择文件保存；重装在新浏览器恢复王林 |
| 禁用/卸载/重装 | **PASS**：原生disable/enable；停止→remove→冷启动路由404、无插件条目→reinstall；selection文件字节保留 |
| 四插件同Profile | **PASS（latest，Linux/scripted）**：无Bundle/Slots/route/preset/service重复；多步工作区工具与Router共同执行 |
| 所有十一主题/四滑条完整真实浏览器遍历、故障回滚重演、历史未scoped迁移、Windows/Desktop/全部peer区间 | **NOT TESTED**（本轮）；已有历史测试记录不当作本轮运行证据 |

仓库外一次性正式入口诊断：`node /workspace/audit-lab/run.mjs theme /workspace/audit-runtime/latest`、同命令rc2、`... all`；诊断脚本与脱敏结果随总交付保留。测试使用各自临时DSH_HOME/DSH_AGENTS_HOME，真实Loader/HTTP/Chromium与scripted原生Agent，不用静态图替代运行。可手工重复CLI固定tgz add→Web登录选主题/详情→停Host/remove→冷启动404→reinstall恢复。

建议审查PR后再从干净提交生成**新版本固定产物**，人工发布；不应重用已发布0.3.22包名版本覆盖现有包。两版最低生命周期与核心主题路径已验证；未测平台/历史名称迁移和UI内部选择器仍需单独验收。无需继续增加主题管理/卸载框架。
