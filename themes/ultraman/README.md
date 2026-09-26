# 奥特曼灵感 · DSH 光之巨人主题

独立的 DeepSeek Harness Web 客户端主题插件。红银色点缀、深蓝宇宙、蓝色能量核心，保留 DSH 原有工作区、会话、输入与模型功能。

![带发光双眼的主题概念样图](assets/concept-preview.webp)

> 样图用于展示视觉方向。插件用单独的原创宇宙背景和 DSH 的主题 token 实现外观；不把整张界面截图盖在真实 UI 上。巨人、双眼、能量核心均为原创视觉，未使用官方角色素材、商标或标志。本项目是非官方粉丝创作，与 DeepSeek 或奥特曼作品方无关联。

## 运行中的状态

DSH 正在回复时，运行提示会显示「光能解析 · 聚焦中」；计时后显示「光能解析 · 已持续 12 秒」。左侧蓝色能量核心缓缓脉动，进度线流动。系统开启“减少动态效果”后，动画停止。完成、停止和失败提示保持原文，屏幕阅读器的状态播报也保持原样。

## 安装

支持 DSH Web 中的 `ctx.theme` 接口，按照 `dsh-v0.1.7-rc.1` 的客户端约定制作。安装前先卸载其他自动启用的独立主题插件，例如 `dsh-shanhe-theme`，以免两个插件同时挂载装饰层。

```bash
git clone https://github.com/xuanyi-niubi/dsh-shanhe-theme.git
cd dsh-shanhe-theme/themes/ultraman
npm run pack:local
dsh plugin --profile web add ./dsh-ultraman-theme-0.1.0.tgz
```

重启 `dsh web` 并刷新浏览器。卸载：

```bash
dsh plugin --profile web remove dsh-ultraman-theme
```

## 开发

```bash
npm run build
npm test
npm pack --dry-run
```

`src/client.mjs` 注册深色语义 token 并仅装饰运行中的进程提示。`assets/theme.css` 与 `assets/cosmic-scene.webp` 在构建时内嵌至 `lib/client.js`，运行时无需下载背景图。`cordis.patch.yml` 供 `dsh plugin add` 自动挂载。图像资源是原创生成的视觉资产；代码使用 MIT 许可。

实际 Web 界面的主区域若不使用 `main` 或 `[role="main"]`，主题配色仍生效，但宇宙背景可能不会显示。样图中的首页标题和输入提示是概念文案，目前插件不会改写 DSH 的这些功能文字。
