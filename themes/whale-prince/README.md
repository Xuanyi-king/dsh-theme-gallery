# 鲸少 · 沧海之主 DSH 主题

DeepSeek Harness Web 的独立男性角色主题。深海巨鲸、海上王城、藏蓝长衣和冷金肩甲组成沉稳而有气势的海洋界面。工作区、会话、输入与模型功能沿用 DSH。

![鲸少主题概念样图](assets/concept-preview.webp)

> 样图展示视觉方向。实际插件使用单独的原创海洋背景和 DSH 主题 token，不把样图盖在真实界面上。角色与巨鲸为原创生成的视觉素材，不使用 DeepSeek 官方标识或鲸鱼形象；本项目与 DeepSeek 无关联。

## 运行中的状态

回复进行时视觉提示为「鲸息推演 · 潮声渐起」，计时后为「鲸息推演 · 已航 12 秒」。鲸尾轻摆，蓝色潮纹沿提示底边掠过。系统开启“减少动态效果”后动画停止。完成、停止和失败状态保留原文，屏幕阅读器继续使用 DSH 原始状态播报。

## 安装与切换

在 DSH 桌面应用「插件 → 添加插件」中粘贴 `@xuanyi-king/dsh-theme-gallery` 安装统一主题库，然后到「设置 → 主题」选择「鲸少 · 沧海之主」。也可用 Web profile 一条命令安装：

```bash
dsh plugin --profile web add @xuanyi-king/dsh-theme-gallery
```

在「设置 → 主题」中可随时切换其他主题或选择「跟随 DSH」恢复默认。完整说明见[仓库首页](../../README.md)。

## 开发

```bash
npm run build
npm test
npm pack --dry-run
```

`assets/ocean-lord.webp` 构建时嵌入 `lib/client.js`，运行时无需下载素材。代码使用 MIT 许可。若 DSH 主区域不使用 `main` 或 `[role="main"]`，配色仍生效，但海洋场景可能不显示。样图中的首页标题和输入提示仅作概念展示，插件只调整回复中的状态视觉。
