# 山河剑意 · DSH 主题

为 DeepSeek Harness Web 设计的水墨主题插件。宣纸暖底、浅墨远山、朱砂交互色；只修改界面外观，不接触会话、模型或文件内容。灵感来自古风山水与江湖意境，不包含《剑来》的角色、文字或官方美术素材。

![山河剑意主题概念样图](assets/concept-preview.webp)

> 图片是设计概念图；实际主题保留 DSH 原有界面文字与功能，山水细节由插件内嵌 SVG 绘制。

### 运行中的状态

回复前的进程提示会呈现为「问道山海 · 求索中」；计时开始后显示「问道山海 · 已行 12 秒」等实时用时。左侧朱砂小印轻轻明暗起伏，底部墨线缓慢流动。动画会遵循系统的“减少动态效果”设置。

这层显示只作用于 DSH 0.1.7 的运行中 Turn 按钮；已完成、停止和失败状态保留原文字，供屏幕阅读器读取的状态播报也保持原样。若 DSH 后续修改该按钮的 DOM 结构，装饰可能不再生效，但原有状态仍可正常阅读。

## 安装

适用于提供 `ctx.theme` 扩展的 DSH Web 客户端。已按 `dsh-v0.1.7-rc.1` 的主题接口检查插件结构。

```bash
git clone https://github.com/xuanyi-niubi/dsh-shanhe-theme.git
cd dsh-shanhe-theme
npm run pack:local
dsh plugin --profile web add ./dsh-shanhe-theme-0.1.1.tgz
```

重启 `dsh web`，刷新网页。安装后主题会自动启用。如果同时装有其他自动选主题的插件，最后加载的插件可能接管外观。

卸载：

```bash
dsh plugin --profile web remove dsh-shanhe-theme
```

## 开发

```bash
npm run build
npm test
npm pack --dry-run
```

`src/client.mjs` 注册主题 token；`assets/theme.css` 和 `assets/landscape.svg` 随构建内嵌于 `lib/client.js`，无需联网加载图像或字体。`cordis.patch.yml` 让 `dsh plugin add` 自动挂载插件。npm 包同时包含预构建的 `lib/`，下载仓库源码后可直接本地打包。

这是一版可运行的主题实现，首页场景使用抽象原创山水 SVG。先前的概念样图展示了更丰富的水墨笔触、书法标题和剑形边栏；这些细节依赖 DSH 具体版本的组件结构，没有把不稳定的内部类名写死到插件中。若主区域未采用 `main` 或 `[role="main"]`，颜色仍会生效，山水背景可能不会显示。

## 许可

MIT。项目与 DeepSeek 官方及《剑来》作品方无关联。
