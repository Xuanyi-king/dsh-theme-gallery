# DSH 主题库

为 DeepSeek Harness Web 制作的独立主题合集。每款主题都是一个可以通过 `dsh plugin --profile web add` 安装、更新和卸载的插件。仓库地址沿用最初的 `dsh-shanhe-theme`，现在承载多款主题。

| 主题 | 预览 | 风格 | 插件目录 |
| --- | --- | --- | --- |
| 山河剑意 | [查看样图](themes/shanhe/assets/concept-preview.webp) | 宣纸、水墨、朱砂、流动墨线 | [`themes/shanhe`](themes/shanhe/) |
| 光之巨人（奥特曼灵感） | [查看样图](themes/ultraman/assets/concept-preview.webp) | 红银点缀、星空、蓝色能量核心 | [`themes/ultraman`](themes/ultraman/) |
| 荒天帝意象（完美世界灵感） | [查看样图](themes/perfect-world/assets/concept-preview.webp) | 黑金战甲、赤色披风、诸天宫阙 | [`themes/perfect-world`](themes/perfect-world/) |
| 炎帝意象（斗破苍穹灵感） | [查看样图](themes/flame-emperor/assets/concept-preview.webp) | 黑袍重尺、青色火莲、赤色火山 | [`themes/flame-emperor`](themes/flame-emperor/) |
| 齐天大圣 | [查看样图](themes/great-sage/assets/concept-preview.webp) | 火眼金睛、金箍棒、云海天宫 | [`themes/great-sage`](themes/great-sage/) |
| 哪吒 · 莲身破浪 | [查看样图](themes/nezha/assets/concept-preview.webp) | 混天绫、乾坤圈、火尖枪、风火轮 | [`themes/nezha`](themes/nezha/) |

六款均保留 DSH 的工作区与对话功能，运行中的回复状态分别有对应文案和轻量动画。外观图像均是原创生成的视觉素材；作品灵感主题均为非官方同人设计。

## 安装一款主题

克隆仓库后，只打包要安装的主题：

```bash
git clone https://github.com/xuanyi-niubi/dsh-shanhe-theme.git
cd dsh-shanhe-theme
npm run build
npm run pack:shanhe
dsh plugin --profile web add ./dsh-shanhe-theme-0.1.1.tgz
```

安装光之巨人主题时，把最后两行换成：

```bash
npm run pack:ultraman
dsh plugin --profile web add ./dsh-ultraman-theme-0.1.0.tgz
```

安装荒天帝意象主题时，把最后两行换成：

```bash
npm run pack:perfect-world
dsh plugin --profile web add ./dsh-perfect-world-theme-0.1.0.tgz
```

安装炎帝意象主题时，把最后两行换成：

```bash
npm run pack:flame-emperor
dsh plugin --profile web add ./dsh-flame-emperor-theme-0.1.0.tgz
```

安装齐天大圣主题时，把最后两行换成：

```bash
npm run pack:great-sage
dsh plugin --profile web add ./dsh-great-sage-theme-0.1.0.tgz
```

安装哪吒主题时，把最后两行换成：

```bash
npm run pack:nezha
dsh plugin --profile web add ./dsh-nezha-theme-0.1.0.tgz
```

执行 `dsh web` 或重启现有服务，再刷新网页。六款插件目前都会自动启用自己的主题；切换时先卸载当前主题，再安装下一款，避免装饰层同时生效：

```bash
dsh plugin --profile web remove dsh-shanhe-theme
# 或：dsh plugin --profile web remove dsh-ultraman-theme
# 或：dsh plugin --profile web remove dsh-perfect-world-theme
# 或：dsh plugin --profile web remove dsh-flame-emperor-theme
# 或：dsh plugin --profile web remove dsh-great-sage-theme
# 或：dsh plugin --profile web remove dsh-nezha-theme
```

## 开发与验证

```bash
npm run build
npm test
```

各主题的配色、资源和测试分别位于 `themes/<name>/`。根目录不发布 npm 包，不改动 DSH 源码。单款主题的能力与限制详见对应目录里的 README。
