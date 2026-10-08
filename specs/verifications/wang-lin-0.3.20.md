# 王林 · 一念仙逆 v0.3.20 验证记录

基于 `main` 的 `a213146b15fd1a641b6b662b8592acd4429d84e3`，2026-10-08 验证。用户确认样图后实现。王林只提供统一主题库的配色与资源，没有独立插件清单、安装包或安装命令。

## 自动验证

```bash
npm run build && npm test && npm run pack:gallery
DSH_INTRO_BROWSER_TOOLS=/tmp/dsh-browser-tools \
DSH_INTRO_BROWSER_EXECUTABLE=/usr/bin/chromium \
node scripts/verify-startup-browser.mjs
```

- 构建、测试、打包命令退出码 0；旧主题工作区 55 个、统一主题库 57 个，共 112 个测试通过。
- 根目录产物 `dsh-theme-gallery-0.3.20.tgz`，8 个文件，约 2.7 MB；壁纸与缩略图内联于统一客户端。
- 浏览器验证使用真实 React 与构建后的客户端，覆盖全部 11 款主题的桌面、手机、320px 与短横屏开场；跳过、Esc、焦点、自动关闭、减少动态效果与恢复均通过。
- 王林运行状态测试覆盖中文及英文计时文案、赤银印记的轻微呼吸、减少动态效果、默认恢复；使用原生结构夹具验证实际 CSS 与文本观察器。
- `git diff --check` 通过；独立代码审阅未发现需要修复的问题。

## 真实 DSH 安装与界面

在 Linux 环境使用官方发布的 `@deepseek-ai/dsh` 0.2.0-rc.2，Chromium 1440×900、390×844 与 320×568。浏览器工具安装于仓库外，无新增运行依赖。

```bash
DSH_HOME=/tmp/dsh-wanglin-packed-home dsh plugin --profile web add \
  /workspace/dsh-theme-gallery/dsh-theme-gallery-0.3.20.tgz
DSH_HOME=/tmp/dsh-wanglin-packed-home dsh --profile web \
  --patch /workspace/DeepSeek-Harness/apps/web/tests/pin-browse-picker.overlay.yml \
  --no-open --host 127.0.0.1 --port 3081
```

使用全新配置目录安装打包产物，安装目录为实际文件副本；已比对安装客户端与仓库构建客户端的 SHA-256 一致。目录选择使用 DSH 自带的浏览器目录选择器测试覆盖配置，并通过原生界面打开本仓库工作区。首次启动的 API Key 引导选择「稍后配置」。

真实 DSH 自动浏览器检查通过：

- 14 张选择卡（11 款主题与 3 个内置选项），逐一点击即时更新，切换不会重新播放开场。
- 王林原生首页标题、输入提示、主题选中态正常；选择 API 返回 200 并写入 `gallery-wang-lin`。
- 四个滑条即时更新 CSS 变量，刷新后恢复全部数值；截图使用默认值。
- 原生输入区可以输入和清空；390px 与 320px 输入卡均未越出视口，窄屏主题选择可用。
- 「跟随 DSH」恢复原生标题和当前工作区输入提示，去除主题覆盖，服务端存储 `null`；刷新后仍为默认且没有主题开场。
- 清空浏览器主题存储、仅保留认证 Cookie，新浏览器从实际 Host 磁盘恢复王林主题；桌面与手机开场、Esc、跳过、减少动态效果正常。
- 终止并重启官方 DSH 进程，在相同配置目录中启动；全新浏览器再次从磁盘恢复王林，验证不是只依靠页面本地存储。
- 浏览器运行期间没有 `pageerror`。

## 实际界面截图

截图来自上述真实 DSH，未经合成；主题设置保留四个原有滑条。

| 界面 | 截图 |
| --- | --- |
| 桌面首页 | [home-desktop.png](wang-lin/home-desktop.png) |
| 桌面设置 | [settings-desktop.png](wang-lin/settings-desktop.png) |
| 390px 首页 | [home-mobile.png](wang-lin/home-mobile.png) |
| 390px 设置 | [settings-mobile.png](wang-lin/settings-mobile.png) |
| 320px 首页 | [home-320px.png](wang-lin/home-320px.png) |
| 桌面开场 | [intro-desktop.png](wang-lin/intro-desktop.png) |
| 手机开场 | [intro-mobile.png](wang-lin/intro-mobile.png) |

## 验证范围

真实宿主检查的是官方 DSH 的 Web 客户端；未运行 Windows/macOS 桌面安装程序或原生标题栏。没有配置 API Key、没有提交付费模型请求；运行状态文案与动画由原生结构浏览器夹具及单元测试验证，未宣称完成真实模型生成测试。
