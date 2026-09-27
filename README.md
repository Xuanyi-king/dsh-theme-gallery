# DSH 主题库

一个插件，七款主题。安装后在 DeepSeek Harness 的「设置 → 主题」中随时切换，也可以选「跟随 DSH」恢复默认；选中的主题在关闭并重新打开 DSH 后仍会保留。

主题设置提供「背景深淡」「背景模糊」「文字对比」三个滑条。深淡调节主题底色盖住场景的程度，不改变屏幕整体亮度。拖动即可预览，数值保存在当前设备，重启后仍然有效；选择 DSH 内置主题时这些调节不会改变内置外观。模型生成回复期间，每款主题在原生进度栏显示自己的文字与小型动态标记；启用系统的减少动态效果后，标记保持静止。

| 主题 | 样图 | 风格 |
| --- | --- | --- |
| 山河剑意 | [查看样图](themes/shanhe/assets/concept-preview.webp) | 宣纸、水墨、朱砂、流动墨线 |
| 光之巨人（奥特曼灵感） | [查看样图](themes/ultraman/assets/concept-preview.webp) | 红银点缀、星空、蓝色能量核心 |
| 荒天帝意象（完美世界灵感） | [查看样图](themes/perfect-world/assets/concept-preview.webp) | 黑金战甲、赤色披风、诸天宫阙 |
| 炎帝意象（斗破苍穹灵感） | [查看样图](themes/flame-emperor/assets/concept-preview.webp) | 黑袍重尺、青色火莲、赤色火山 |
| 齐天大圣 | [查看样图](themes/great-sage/assets/concept-preview.webp) | 火眼金睛、金箍棒、云海天宫 |
| 哪吒 · 莲身破浪 | [查看样图](themes/nezha/assets/concept-preview.webp) | 混天绫、乾坤圈、火尖枪、风火轮 |
| 鲸少 · 沧海之主 | [查看样图](themes/whale-prince/assets/concept-preview.webp) | 男性海洋守望者、巨鲸、深海王城 |

主题图像为原创视觉素材，相关作品灵感主题均为非官方设计。每款主题都有专属配色和场景图；背景覆盖 DSH 的实际对话区域，文字区域保留渐变遮罩以便阅读。运行提示使用 DSH 原生文字，避免装饰动画干扰阅读。
主题会同时处理原有侧栏、聊天画布和输入卡片的视觉层；没有添加、替换 DSH 的功能按钮。山河主题使用水墨 WebP 场景，已停止使用旧版的抽象 SVG 山形。

## 安装

在 DSH 桌面应用中打开「插件 → 添加插件」，在输入框粘贴下面的仓库地址，点击「安装」：

```text
https://github.com/xuanyi-niubi/dsh-theme-gallery
```

通过 Web profile 的命令行安装时，也只需一条命令：

```bash
dsh plugin --profile web add https://github.com/xuanyi-niubi/dsh-theme-gallery
```

安装后打开「设置 → 主题」，点击喜欢的主题卡片即可切换，不需要为每款主题分别安装插件。
从旧版升级后，请在「设置 → 主题」重新点击所选主题，并关闭、重开一次 DSH。已安装的旧版单款主题插件需要移除，避免同时覆盖界面样式。

## 切换、恢复与保存

「设置 → 主题」包含七款主题和「跟随 DSH」「DSH 明亮」「DSH 深色」三个内置选项。选择「跟随 DSH」会清除主题库的覆盖设置，恢复 DSH 默认外观；随时可以再次选择主题。

选择会写入 DSH 本机配置目录中的 `dsh-theme-gallery/selection.json`；页面同时保存本地副本，供宿主未提供配置接口时恢复。重启 DSH 后会重新读取选择。如果此前安装过旧版单款主题插件，请先移除那些旧插件，避免旧版装饰同时运行。

## 开发与验证

```bash
npm run build
npm test
npm run pack:gallery
```

仓库根目录是统一安装包。各款主题的原始资源与测试保留在 `themes/<name>/`，便于继续迭代。
