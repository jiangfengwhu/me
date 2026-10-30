# JIANG FENG · 可以翻开的自我介绍

36 秒 / 1920×1080 / 30 fps / 无口播 / 原创配乐与 18 个动作音效。

## 预览和修改

从仓库根目录运行：

```sh
node scripts/build-me-intro.mjs
npx huashu-motion studio motion/me-intro --no-open
```

打开命令输出的地址。当前会话为 `http://localhost:4851/`，纯看片页面为 `http://localhost:4851/p/tools/watch.html`。点击画面播放、暂停，悬停显示进度与音量。工作室里按 C，可直接在对应时间、对应画面留言。

`index.html` 声明可编辑文案、颜色和结尾时长。`assets/motion.js` 编排镜头与七支原始动画。`assets/style.css` 控制字幕和画面排版。

## 原站素材

3D 场景直接复用 `src/webgl/NightStreetScene.js`，包括原始书架、书本、卡片、公司标志、头像和 Saber 人偶。影片适配器位于 `tools/scene-source.js`，只替换交互输入为时间驱动的镜头。

七支产品动画来自 `public/films`，拷贝时移除各自播放器，将它们的原始暂停时间轴交给本片驱动。全部素材、字体和依赖在本地，不需要访问线上站点。

修改原站素材后，重新同步与打包：

```sh
node scripts/build-me-intro.mjs
npx huashu-motion sound motion/me-intro
```

配乐写在 `index.html` 的 `om-score` 中。改动节奏后重新运行 sound；不要手改生成的 `assets/sound.wav`。

`treatment.md` 保留创意与镜头方案，`stills` 保留关键画面。本次交付可编辑 HTML 与预览，没有导出 MP4，也没有改动线上网站。
