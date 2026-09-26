# 斗破苍穹灵感 · 炎帝意象主题

DeepSeek Harness Web 的独立主题插件。黑袍、重尺、青色火莲与赤色火山构成异火氛围，保留 DSH 的工作区、会话、输入和模型功能。

![炎帝灵感主题概念样图](assets/concept-preview.webp)

> 样图展示视觉方向。插件使用单独的原创背景和 DSH 主题 token，不把整张截图盖在真实 UI 上。人物为原创生成的灵感形象，并非萧炎动画原画或官方素材。本项目为非官方同人设计，与《斗破苍穹》作品方及 DeepSeek 无关联。

## 运行中的状态

回复进行时视觉提示为「异火推演 · 凝焰中」，计时后显示「异火推演 · 已炼 12 秒」。青色火纹轻轻脉动，橙青流光沿底边流动。系统开启“减少动态效果”后停止动画。完成、停止和失败提示保持原文；屏幕阅读器继续使用 DSH 原始状态播报。

## 安装

按 DSH `v0.1.7-rc.1` Web 客户端的 `ctx.theme` 接口制作。先卸载正在自动启用的其他主题，再安装：

```bash
git clone https://github.com/xuanyi-niubi/dsh-shanhe-theme.git
cd dsh-shanhe-theme/themes/flame-emperor
npm run pack:local
dsh plugin --profile web add ./dsh-flame-emperor-theme-0.1.0.tgz
```

重启 `dsh web` 并刷新浏览器。卸载：

```bash
dsh plugin --profile web remove dsh-flame-emperor-theme
```

## 开发

```bash
npm run build
npm test
npm pack --dry-run
```

`assets/flame-scene.webp` 在构建时内嵌到 `lib/client.js`，运行时无需下载素材。代码使用 MIT 许可。若 DSH 主区域不采用 `main` 或 `[role="main"]`，配色仍生效，但场景背景可能不显示。样图的首页标题与输入占位文字是概念文案，插件只改变运行中的回复状态提示。
