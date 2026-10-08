# Theme Center v0.3.21：设计与源码证据

## 范围与基线

用户授权仓库内实现、构建、隔离宿主测试及本地提交，不授权生产安装变更、宿主升级、发布或推送 main。基线 `deb3c0b` / 0.3.20，工作区干净，无 AGENTS.md；2026-10-08 `npm run build && npm test` 退出 0，共 112 个测试，无既有失败。Node 24.19.0。用户进一步指定主要适配目标为官方 `dsh-v0.2.1-alpha.1`（tag `5badb15009ae1756c3afe0ae0cef1faafc290ccc`）；0.2.0-rc.2 作为旧版回归目标。

## 参考资料

参考 Skill 固定 commit `ef075767b476e8000c716a18f848028eebcd5aef`。完整阅读 `oh-my-dsh/dsh-plugin-upgrade-skill` 的 plugin-workflow、plugin-upgrade、plugin-test、plugin-release、plugin-runtime-debug 五份 SKILL 及 pre-flight、rollup-0.1.2、profile-dependency-management。采用其安装/加载身份分离、基线备份、产物验证、prerelease 匹配和 junction 边界；历史卡不作为 alpha.1 的契约。

官方证据均基于固定 tag [dsh-v0.2.1-alpha.1](https://github.com/deepseek-ai/deepseek-harness/tree/dsh-v0.2.1-alpha.1)，同时用 `git show dsh-v0.2.0-rc.2:<path>`核对旧版：

| 能力 | 源码 | 契约与约束 |
| --- | --- | --- |
| 原生主题导航 | [packages/client/ui-sidebar/src/client/contract/slots.ts](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/client/ui-sidebar/src/client/contract/slots.ts)、`SidebarRoot.tsx` | `sidebar.panellist` 根级 list；id 对应 main key；原生按钮处理折叠、aria、键盘、焦点。 |
| 独立页面 | [packages/client/ui-layout/src/client/index.ts](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/client/ui-layout/src/client/index.ts)、`service.ts` | 根级 keyed `main`；`selectPanel(id)` 拒绝未注册 key；null 回到会话，保留当前 Session。 |
| 等待声明与释放 | [packages/client/ui-plugin-manager/src/client/index.ts](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/client/ui-plugin-manager/src/client/index.ts) | 用 `slots.inject` 等待声明并返回 register disposer；插件入口 order 0，新主题入口 order 5。 |
| 原生插件详情 | 同上 | `pluginNavigation.openBundle(packageName)` 导航到插件详情，缺失包显示列表；不执行安装。 |
| Host 管理接口 | [packages/boot/plugin-manager/src/index.ts](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/boot/plugin-manager/src/index.ts)、`types.ts` | listBundles/listPlugins/inspect/setPluginEnabled/setBundleEnabled/installBundle/uninstallBundle/waitForInstall/cancelInstall 等，RemoteResult 需检查 ok；无 upgrade 事务。安装恢复 package.json/锁文件，不等于卸载后完整版本回滚。 |
| 宿主版本/peer | [packages/boot/app-boot/src/plugin-compatibility.ts](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/boot/app-boot/src/plugin-compatibility.ts) | getDshRuntimeVersion 读正在加载的 app-boot；SemVer includePrerelease:true，`^0.2.1` 不接纳 alpha.1。 |
| 当前 profile | [packages/boot/app-boot/src/profile-context.ts](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/boot/app-boot/src/profile-context.ts) | profileContext 提供真实 dir/home/installAnchor；不猜默认 profile 路径。 |
| HTTP 安全 | [packages/client/connection/src/index.ts](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/client/connection/src/index.ts)、`rpc-host.ts` | connection.fetch.register 的 `/api/...` 路由经过 Host/Origin 与 Cookie 鉴权；普通 webServer 路由不自动继承。 |
| 加载/HMR | [packages/boot/plugin-manager/src/index.ts](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.1/packages/boot/plugin-manager/src/index.ts)、`packages/client/modules` | installed/application/active 不同；客户端 combo 与缓存需重启/硬刷新验证。不能由安装退出码推断 active。 |

## 架构

现有 `applyGallery` 继续拥有主题/滑条/文本观察器的插件级生命周期，`createGallerySection` 复用卡片及滑条。独立 `main` 页面在顶部组合更新面板；关闭页面仅解除 React 订阅，不销毁主题控制器。移除 settings.section 注册，保留 shell.overlay。

新增 Host 更新模块只读检查安装身份、可信 GitHub 发布/commit、目标 manifest、bundle、Host 文件、patch 及哈希清单；唯一写操作是按需保存本插件的恢复基线。新增 Client 更新控制器独立于页面挂载，持有请求取消/超时、状态、备份导出与官方导航。没有执行安装的路由、子进程或安装权限。

## 身份与可信目标

页面分别展示实际 Client BUILD_INFO、当前 Host 构建、磁盘 manifest、安装源、锁定 commit（能证明时）、远端目标 commit。构建生成 metadata，bundle 版本与 manifest 精确相等，hash 绑定产物；不能证明运行源码 commit 时显示未知，不能把 HEAD 或 README 文本当成本地运行版本。

固定可信仓库 Xuanyi-king/dsh-theme-gallery。优先正式 GitHub Releases（跳过 draft/prerelease，核对 tag 与 manifest），无 Release 时读取默认分支 HEAD 的 commit，再按该 commit 读取 manifest、Client、build-info、artifact.json、四个 Host 文件和 patch，核对固定模块 ID、声明依赖、22 个内嵌 WebP、版本及 SHA256；所有 URL 由固定 origin 构造，拒绝重定向和外部 download URL。不接受用户提供下载源。网络/限流/超时为失败或未知，远端版本落后也不伪称最新。Git 安装无法读取锁定 commit 时只能未知。

安装方式分类 GitHub、registry、link/junction、本地目录、tarball、unknown。依赖声明和 lockfile 分别读取；只有 Profile 解析 realpath 与实际加载目录相同才采用该来源，普通 pnpm store 链接与源码链接分开判断，跨盘 Windows 路径不能当作 store；不删除锁文件、不移动链接目标、不修改 profile manifest/其他插件。

## 预检、备份与引导

预检返回各项 compatible/incompatible/unknown/unsupported：DSH/Node/全部 DSH peer SemVer、真实目标 commit、manifest/bundle/hash、安装目录可写、重复入口与宿主 active、备份位置、并发请求。缺失证据为 unknown；不兼容为 incompatible。

alpha.1 无独立、安全、可回滚的升级事务，执行能力始终 unsupported。即使其他检查 compatible，也仅提供「保存恢复基线」「打开原生插件详情」及自包含更新说明；不显示伪一键安装。备份只读取并保留本插件 selection.json 的原始字节（含未知字段）、浏览器主题副本及视觉配置、安装身份和准确恢复步骤。备份拒绝 owned 目录、子目录或选择文件的 symlink/junction 边界；在本插件目录内独有记录，不复制 DSH_HOME。安装与回滚留给外部 Agent/用户经明确确认执行。

## 状态与失败恢复

实际可达状态是 idle/checking/available/up-to-date/preflight/unsupported/incompatible/failed/unknown/verifying/success/restart-required/rollback-required。没有更新执行器，不产生 updating/installed/rolled-back，也不把下载或命令退出码当成成功。下载/安装失败由人工恢复说明区分；Host/client 加载失败、配置错配与结果未知由运行核验区分。

「重新验证运行状态」从浏览器持久化的基线 ID 读回 Host 保存的固定 target 和原始配置（不依赖重启前的内存 target）。Host 比较实际磁盘/运行版本和哈希、唯一 active 入口、selection.json 原字节、浏览器两个 owned 键。Client 通过已注册槽位标志、全部 WebP 实际解码及主题控制器/DOM/四滑条当前值报告界面证据。缺失目标、基线或证据只能 unknown，缓存版本未切换则等待重启/硬刷新；配置错配提示人工恢复。这是引导更新后的核验，不能替代完整安装事务。
防重复请求、总超时、取消、插件卸载 abort、页面关闭继续只读任务；所有异步最终响应在卸载/取消后统一阻止成功；新检查清除旧 target 与预检明细。不持久化过时 success。备份可下载便于卸载后外部恢复。运行时默认一次非阻塞只读检查，不自动安装。

## 风险与测试

高风险：自卸载事务、Windows 文件占用、link 源目录删除、篡改其他插件。解决：不执行安装/删除/宿主重启；只通过官方导航引导，Windows 外部停止宿主后安装、再启动并硬刷新。
中风险：旧锁 commit、缓存 bundle、丢失配置、网络错误伪最新。解决：分离身份/hash，真实 SemVer，逐项预检，唯一备份，故障注入，不确定则 unknown。

单元与真实 HTTP 集成测试注入网络错误/限流/超时/结果丢失、旧锁、manifest/bundle 错配、link/junction、peer prerelease、并发、卸载；比对原安装与其他配置字节未变。真实 React 界面验证新旧入口、折叠/键盘/中英文、页面生命周期、11 款主题和四项持久化。固定 alpha.1 的隔离 Profile 安装打包产物，验证冷启动、active、主题中心、默认恢复和重启。Windows 原生环境不可用时标注阻塞，不能用 CSS 模拟冒充真实桌面验收。

## 实施计划

1. 先写更新逻辑/故障测试，再实现 Host 身份、检查、结构化预检与限定备份。
2. 先改导航注册测试与新增控制器测试，再实现 main/sidebar、更新面板与独立生命周期；保留旧功能断言。
3. 运行针对性测试和真实浏览器，修复失效路径；隔离 alpha.1 主验收与 rc.2 回归。
4. 版本 0.3.21 → 重新 build → test → pack → 检查 manifest、Host、Client、产物一致 → 验收记录 → 本地提交，不发布。
