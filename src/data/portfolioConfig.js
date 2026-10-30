/**
 * ============================================================================
 * JIANG FENG (@jiangfengwhu) — PERSONAL HOMEPAGE & PORTFOLIO CONFIGURATION
 * ============================================================================
 * Architecture:
 * - Page Evolution & Visual Language: Lusion (https://lusion.co/)
 * - Portfolio Shelf & Book Inspector: Stripe Press (https://press.stripe.com/)
 *
 * Easily add, edit, or reorder portfolio items in `BOOKS`, update bio/SNS
 * links in `PROFILE` and `SOCIAL_LINKS`, or append new capability cards in
 * `CAPABILITIES`. Users can also append mock books interactively via the UI.
 * ============================================================================
 */

import githubSnapshot from './githubSnapshot.json' with { type: 'json' };

export const PROFILE = {
  handle: 'jiangfengwhu',
  name: 'JIANG FENG',
  creatorAlias: '小苍AI干货',
  xhsId: '94126430446',
  xhsUrl: 'https://www.xiaohongshu.com/user/profile/67bff05c0000000006012177',
  xUrl: 'https://x.com/jiangfengwhu202',
  email: '809740942@qq.com',
  avatar: '/assets/avatar.png',
  githubUrl: 'https://github.com/jiangfengwhu',
  labDomain: 'https://pindou.297782.xyz/',
  location: 'Wuhan · Beijing · Cloud Native',
  almaMater: 'Wuhan University (WHU)',
  role: 'Ex-Big Tech Engineer · Creative AI & 3D Full-Stack Architect',
  heroKicker: 'CREATIVE ENGINEERING STUDIO // GITHUB.COM/JIANGFENGWHU',
  heroHeadline: 'Beyond Code.\nInto Tactile Worlds.',
  heroSubheadline:
    '前大厂工程师 · 武汉大学 (WHU) · 专注于 WebGL 3D 交互视觉、AI 原生生产力工作台、跨端动态容器与高并发后端架构。把冰冷的算法，装帧成有温度的数字造物。',
  manifestoTitle: '把复杂留给工程，\n把直觉还给体验。',
  manifestoLead:
    '从一行像素采样算法，到 27 秒全自动运镜的 3D 胶片秀场；从零门槛的本地优先小工具，到云端 Agent 驱动的跨平台动态宿主——每一件作品都像一本精心装帧的硬壳书：翻开即可体验，数据留在本地，细节经得起推敲。',
  reelStats: [
    { label: 'PUBLIC REPOSITORIES', value: '43+', note: 'Since Oct 2016 on GitHub' },
    { label: 'LIVE CREATIVE APPS', value: '04', note: '*.297782.xyz Production Suite' },
    { label: 'HTML/3D SHOWREELS', value: '93s', note: 'Procedural WebGL & Web Audio' },
    { label: 'CORE STACKS', value: '06', note: 'TS · Go · Three.js · Kotlin · Flutter · Swift' }
  ],
  goalStatement: {
    eyebrow: 'ENGINEERING PHILOSOPHY',
    headline: 'CRAFTING ZERO-FRICTION\nAI & 3D EXPERIENCES',
    paragraphs: [
      '我始终相信，最好的技术产品不需要冗长的说明书。无论是把手机相册里的小橘猫变成可旋转的 3D 拼豆模型，还是把一张平铺女装转化为严谨核对细节的 1800×1800 影棚九宫格，核心都是「零摩擦、本地优先、以人为本」。',
      '受 Lusion 的空间流体叙事与 Stripe Press 的实体书籍装帧美学启发，这座个人数字馆藏将我的开源项目与独立作品铸造成一排可触摸、可抽拉、可 360° 翻转检视的 3D 典藏书卷。'
    ]
  }
};

/** Public GitHub data refreshed by scripts/sync-github.py. */
export const GITHUB_ACTIVITY = githubSnapshot.activity;

/**
 * Stripe Press 3D Hardcover Bookshelf Collection
 * Each entry renders as a physical 3D book on the WebGL shelf with custom:
 * - Spine color, cover palette, foil stamping color, and physical dimensions
 * - AI-generated cover illustration (`/assets/covers/cover-*.png`) + procedural typography
 * - Full Stripe Press 58%/42% Inspector metadata, praise quotes, tech specs, and live links
 */
export const BOOKS = [
  {
    "id": "little-traveler",
    "films": [
      {
        "title": "把故事，翻成立体",
        "src": "/films/little-traveler-film/index.html",
        "poster": "/films/little-traveler-film/poster.png",
        "duration": 32,
        "orientation": "landscape"
      }
    ],
    "volume": "VOL. I",
    "edition": "PAPER ART EDITION · 2026",
    "title": "星星上的小旅人",
    "subtitle": "翻开一页，遇见一个小宇宙",
    "spineTitle": "星星上的小旅人 — 互动纸艺立体书",
    "category": "INTERACTIVE POP-UP STORYBOOK",
    "liveUrl": "https://zhezhi.297782.xyz/",
    "coverImage": "/assets/covers/cover-origami.png",
    "dimensions": {
      "width": 22,
      "height": 28.6,
      "thickness": 2.9
    },
    "palette": {
      "coverBg": "#67432c",
      "coverSecondary": "#d9b677",
      "spineBg": "#785a32",
      "spineText": "#fff4dd",
      "foilColor": "#d9b677",
      "pageEdge": "#f7ebd9",
      "accentHex": "#d9b677",
      "detailBg": "#292015"
    },
    "productDescription": "翻开一本纸艺立体书，走进五个星际小故事。纸景沿着书脊收拢、展开，拉动机关、转动视角，发现藏在每一页里的小惊喜。",
    "productFeatures": [
      "五个跨页与连续折叠、展开动画",
      "风车、纸鹤、齿轮与点灯机关",
      "自由调整观看角度"
    ],
    "primaryStack": "Three.js",
    "techStack": [
      "Three.js",
      "WebGL",
      "Paper Mechanics"
    ],
    "metrics": [
      {
        "label": "CHAPTERS",
        "value": "5 pop-up spreads"
      },
      {
        "label": "EXPERIENCE",
        "value": "Fold · Turn · Explore"
      }
    ],
    "legacyIds": [
      "agent-learning-workshop",
      "vibe-container-workbench"
    ],
    "author": "JIANG FENG",
    "year": "2026",
    "repoUrl": "https://github.com/jiangfengwhu",
    "tagline": "翻开一本纸艺立体书，走进五个星际小故事。纸景沿着书脊收拢、展开，拉动机关、转动视角，发现藏在每一页里的小惊喜。",
    "synopsis": [
      "翻开一本纸艺立体书，走进五个星际小故事。纸景沿着书脊收拢、展开，拉动机关、转动视角，发现藏在每一页里的小惊喜。"
    ],
    "highlights": [
      "五个跨页与连续折叠、展开动画",
      "风车、纸鹤、齿轮与点灯机关",
      "自由调整观看角度"
    ],
    "praise": []
  },
  {
    "id": "clack-typewriter",
    "films": [
      {
        "title": "每一声敲击，落在纸上",
        "src": "/films/clack-launch-film/index.html",
        "poster": "/films/clack-launch-film/poster.png",
        "duration": 30,
        "orientation": "landscape"
      }
    ],
    "volume": "VOL. II",
    "edition": "MECHANICAL EDITION · 2026",
    "title": "CLACK 打字机",
    "subtitle": "每一声敲击，落在纸上",
    "spineTitle": "CLACK — 3D 机械打字机记事本",
    "category": "3D TYPEWRITER",
    "liveUrl": "https://typo.297782.xyz/",
    "coverImage": "/assets/covers/cover-clack.png",
    "dimensions": {
      "width": 21.5,
      "height": 28.2,
      "thickness": 2.6
    },
    "palette": {
      "coverBg": "#24262b",
      "coverSecondary": "#e7e7e5",
      "spineBg": "#24262b",
      "spineText": "#fbf9f3",
      "foilColor": "#d95338",
      "pageEdge": "#fbf9f3",
      "accentHex": "#d95338",
      "detailBg": "#202225"
    },
    "productDescription": "在浏览器里，重新感受机械打字的节奏。黑色烤漆机身、下压的键帽、字杆与色带随敲击联动；支持中英文输入，让文字一字一字落在纸上。",
    "productFeatures": [
      "真实 3D 键帽、字杆、色带与字车联动",
      "中文拼音输入与逐键反馈",
      "回车、卷纸与手稿卡片"
    ],
    "primaryStack": "Three.js",
    "techStack": [
      "Three.js",
      "Canvas",
      "Web Audio API"
    ],
    "metrics": [
      {
        "label": "INPUT",
        "value": "Chinese · English"
      },
      {
        "label": "FEEL",
        "value": "Keys · Ink · Paper"
      }
    ],
    "legacyIds": [
      "interview-handbook",
      "comfy-llm-shotty-anthology"
    ],
    "author": "JIANG FENG",
    "year": "2026",
    "repoUrl": "https://github.com/jiangfengwhu",
    "tagline": "在浏览器里，重新感受机械打字的节奏。黑色烤漆机身、下压的键帽、字杆与色带随敲击联动；支持中英文输入，让文字一字一字落在纸上。",
    "synopsis": [
      "在浏览器里，重新感受机械打字的节奏。黑色烤漆机身、下压的键帽、字杆与色带随敲击联动；支持中英文输入，让文字一字一字落在纸上。"
    ],
    "highlights": [
      "真实 3D 键帽、字杆、色带与字车联动",
      "中文拼音输入与逐键反馈",
      "回车、卷纸与手稿卡片"
    ],
    "praise": []
  },
  {
    id: 'pindou-3d-studio',
    productDescription: '把喜欢的照片变成一颗颗立体拼豆。在浏览器里预览、调整配色，再带着图纸开始手作。',
    productFeatures: ['图片转 3D 拼豆', '自由调整颗粒与配色', '导出图纸和用料清单'],
    films: [{ title: '把喜欢，拼成 3D', src: '/films/bead-film/index.html', poster: '/films/bead-film/poster.png', duration: 16, orientation: 'portrait' }],
    volume: 'VOL. III',
    edition: 'FIRST EDITION · 2026',
    title: '豆物 BEAD STUDIO',
    subtitle: '相册里的喜欢，一颗颗立起来 — 图片转 3D 拼豆与图纸工坊',
    spineTitle: '豆物 BEAD STUDIO — 图片转 3D 拼豆工坊',
    author: 'JIANG FENG',
    year: '2026',
    category: 'WebGL 2 · Creative Craft Tool',
    liveUrl: 'https://pindou.297782.xyz/',
    repoUrl: 'https://github.com/jiangfengwhu',
    coverImage: '/assets/covers/cover-pindou.png',
    // Physical dimensions in Stripe Press scene units
    dimensions: {
      width: 22.5,
      height: 29.0,
      thickness: 3.1
    },
    palette: {
      coverBg: '#d9263e',
      coverSecondary: '#ff5c72',
      spineBg: '#c91e35',
      spineText: '#fff8f6',
      foilColor: '#ffd9df',
      pageEdge: '#f8f2ec',
      accentHex: '#ff2442',
      detailBg: '#281019'
    },
    tagline: '把相册里的平面像素，实时锻造成可捧在手心的 WebGL 2 立体拼豆与施工图纸。',
    synopsis: [
      '《豆物 BEAD STUDIO》是一座完全运行在浏览器本地的 2D 图片转 3D 拼豆（Perler Beads）数字工坊。用户只需拖入任意照片（或一键载入内置的「花园里的小橘猫」示例），引擎便会在本地完成像素采样、Floyd-Steinberg 抖色量化，并通过 WebGL 2 InstancedMesh 实时构建出成百上千颗带有中空孔径与明暗浮雕起伏的 3D 拼豆模型。',
      '除了支持在 3D 立体旋转视图与 2D 正交视图之间丝滑切换，工坊还内置了一支 16 秒的原生 HTML+Web Audio 交互式产品宣传片，并支持实时统计 5mm 物理尺寸、悬停检视色号用量，以及一键导出高清 3D 快照、SVG 编号施工图纸与 CSV 配色物料清单（BOM）。'
    ],
    highlights: [
      '100% 浏览器本地像素采样与 8/16/24/32/48 色盘智能量化，支持移除近白背景与像素抖色',
      'WebGL 2 参数化空心圆柱几何：实时调节拼豆横向颗数 (16–100 颗)、厚度 (0.3×–2.0×)、孔径比与明暗浮雕高度',
      '一键导出生产级三大件：PNG 3D 渲染快照、带坐标网格的 SVG 编号图纸、CSV 配色及用量统计表',
      '内置 16 秒原生 HTML 动画宣传片（含 Web Audio 合成音效），无需视频流即可呈现丝滑产品叙事'
    ],
    techStack: ['Three.js (WebGL 2)', 'InstancedMesh', 'Color Quantization', 'Floyd-Steinberg Dither', 'SVG Blueprint Engine', 'CSV BOM Exporter'],
    metrics: [
      { label: 'MAX RESOLUTION', value: '100×100 Beads' },
      { label: 'PALETTE MODES', value: '8 – 48 Colors' },
      { label: 'PRIVACY MODEL', value: '100% Local Memory' }
    ],
    praise: [
      {
        quote: '将像素艺术的颗粒感与 WebGL 2 的物理光影结合得恰到好处，连拼豆中空的孔径与底板卡槽都清晰可辨。',
        source: 'CREATIVE WEBGL REVIEW'
      },
      {
        quote: '从上传照片到导出 SVG 编号施工图纸只需 3 秒，真正为手作玩家省去了繁琐的排豆算色过程。',
        source: 'MAKER TOOLKIT DIGEST'
      }
    ]
  },
  {
    id: 'city-sidekick-dazi',
    productDescription: '给周末找一个舒服的小局。按兴趣、时间和社交电量，发现适合自己的 3–5 人城市活动。',
    productFeatures: ['咖啡、散步、看展与桌游', '破冰话题与轻量行程', '偏好与日程保存在本机'],
    films: [{ title: '把「下次吧」变成「走吧」', src: '/films/city-dazi-film/index.html', poster: '/films/city-dazi-film/poster.png', duration: 22, orientation: 'portrait' }],
    volume: 'VOL. IV',
    edition: 'FIRST EDITION · 2026',
    title: '城市搭子 CITY SIDEKICK',
    subtitle: '一个人出门，也能刚好成局 — 3～5 人低压力同频生活指南',
    spineTitle: '城市搭子 CITY SIDEKICK — 低压力同城小局',
    author: 'JIANG FENG',
    year: '2026',
    category: 'Social Product · Local-First Web App',
    liveUrl: 'https://dazi.297782.xyz/',
    repoUrl: 'https://github.com/jiangfengwhu',
    coverImage: '/assets/covers/cover-dazi.png',
    dimensions: {
      width: 21.8,
      height: 28.4,
      thickness: 2.8
    },
    palette: {
      coverBg: '#2546f0',
      coverSecondary: '#f5fb85',
      spineBg: '#1c39cc',
      spineText: '#f8f9fc',
      foilColor: '#f5fb85',
      pageEdge: '#f4f5f8',
      accentHex: '#3859ff',
      detailBg: '#111d3a'
    },
    tagline: '小局有边界，快乐没负担：可以安静听 · 可以跳过问题 · 可以按时离开 · 不用交换联系方式。',
    synopsis: [
      '在一线城市（北京、上海、深圳、广州），成年人的社交常常陷入「大型聚会太吵、一对一太尴尬」的困境。《城市搭子 CITY SIDEKICK》以「先一起做件小事，再慢慢认识彼此」为核心理念，为慢热、重边界的都市青年设计了一套 3～5 人、60～120 分钟的轻量级小局匹配体验。',
      '产品独创「今日社交电量」三档匹配维度（◔ 低电量慢热 / ◑ 随便聊聊 / ● 状态在线），结合出发片区、3–20km 距离半径与咖啡闲聊、城市散步、看展同游、桌游破冰四大场景，自动生成破冰话题与行程模板，并附带 22 秒 HTML 交互宣传片与四条「安心出门约定」。'
    ],
    highlights: [
      '支持北京、上海、深圳、广州四城片区切换，基于片区距离与时段偏好实时筛选同频小局',
      '独创「社交电量」匹配机制：不给性格打分、不需要立人设，慢热低电量也能舒服参与',
      '结构化小局卡片：内置可切换的破冰话题库、60–120 分钟清晰行程节点与 AA 预算透明说明',
      '隐私与边界优先：全部偏好、日程与反馈保存在本地浏览器，支持一键清空本机体验数据'
    ],
    techStack: ['Vanilla ES Modules', 'Rule-Based Matcher', 'Local-First Storage', 'HTML5 Interactive Film', 'Editorial CSS Grid'],
    metrics: [
      { label: 'GROUP SIZE', value: '3 – 5 People' },
      { label: 'CITIES COVERED', value: 'BJ · SH · SZ · GZ' },
      { label: 'PROMO FILM', value: '22s HTML Animation' }
    ],
    praise: [
      {
        quote: '「可以安静听、可以跳过问题、可以按时离开」——这是我见过对都市慢热人群最温柔也最克制的产品文案与机制设计。',
        source: 'URBAN LIFESTYLE LAB'
      }
    ]
  },
  {
    "id": "xhs-3d-studio",
    "films": [{ "title": "让主页，自己开场", "src": "/films/creator-film/index.html", "poster": "/films/creator-film/poster.svg", "duration": 24, "orientation": "landscape" }],
    "volume": "VOL. V",
    "edition": "CREATOR EDITION · 2026",
    "title": "3D 主页大片",
    "subtitle": "把小红书主页，拍成一支有运镜的宣传片",
    "spineTitle": "3D 主页大片 — 个人频道视频工作台",
    "category": "3D CREATOR TOOLS",
    "liveUrl": "https://xhs-vid.297782.xyz/",
    "coverImage": "/assets/covers/cover-creator.svg",
    "dimensions": {
      "width": 23.2,
      "height": 29.8,
      "thickness": 3.5
    },
    "palette": {
      "coverBg": "#20213e",
      "coverSecondary": "#f5be72",
      "spineBg": "#16172c",
      "spineText": "#fff1d8",
      "foilColor": "#f5be72",
      "pageEdge": "#eee8dc",
      "accentHex": "#f5be72",
      "detailBg": "#302114"
    },
    "productDescription": "上传小红书主页截图，把头像、简介和笔记封面排进 3D 胶片。跟随自动运镜预览，再导出自己的频道宣传片。",
    "productFeatures": [
      "四张截图，自动提取头像与笔记封面",
      "27 秒运镜与合成配乐",
      "自定义资料与浏览器视频导出"
    ],
    "primaryStack": "Three.js",
    "techStack": [
      "Three.js",
      "Web Audio API",
      "MediaRecorder"
    ],
    "metrics": [
      {
        "label": "TIMELINE",
        "value": "27 seconds"
      },
      {
        "label": "SOURCE",
        "value": "4 screenshots"
      }
    ],
    "legacyIds": [
      "xhs-vid-3d-director"
    ],
    "author": "JIANG FENG",
    "year": "2026",
    "repoUrl": "https://github.com/jiangfengwhu",
    "tagline": "上传小红书主页截图，把头像、简介和笔记封面排进 3D 胶片。跟随自动运镜预览，再导出自己的频道宣传片。",
    "synopsis": [
      "上传小红书主页截图，把头像、简介和笔记封面排进 3D 胶片。跟随自动运镜预览，再导出自己的频道宣传片。"
    ],
    "highlights": [
      "四张截图，自动提取头像与笔记封面",
      "27 秒运镜与合成配乐",
      "自定义资料与浏览器视频导出"
    ],
    "praise": []
  },
  {
    id: 'yixu-ai-fashion-studio',
    productDescription: '从一张服装图，寻找下一季的上新灵感。预览模特换装效果，核对服装细节，再整理成商品素材。',
    productFeatures: ['同一模特，六套换装样片', '多种造型与场景参考', '核对细节并导出九宫格'],
    films: [
      { title: '六套换装', src: '/films/yixu-outfits-film/index.html', poster: '/films/yixu-outfits-film/poster.png', duration: 28, orientation: 'landscape' }
    ],
    volume: 'VOL. VI',
    edition: 'STUDIO EDITION · 2026',
    title: '衣序 YIXU STUDIO',
    subtitle: '好衣服，值得好好出镜 — 女装 AI 模特上身图与九宫格工作台',
    spineTitle: '衣序 YIXU STUDIO — AI 时尚摄影与九宫格工作台',
    author: 'JIANG FENG',
    year: '2026',
    category: 'AI Fashion Studio · E-Commerce Workflow',
    liveUrl: 'https://yixu.297782.xyz/',
    repoUrl: 'https://github.com/jiangfengwhu',
    coverImage: '/assets/covers/cover-yixu.png',
    dimensions: {
      width: 22.2,
      height: 29.2,
      thickness: 3.0
    },
    palette: {
      coverBg: '#8c3f2b',
      coverSecondary: '#d8c3b0',
      spineBg: '#783321',
      spineText: '#f7f6f2',
      foilColor: '#e8bea0',
      pageEdge: '#f7f6f2',
      accentHex: '#a44e35',
      detailBg: '#321b17'
    },
    tagline: '从一张平铺图，到一套有序的上新素材——把时间留给选款，把好看的事交给衣序。',
    synopsis: [
      '《衣序 STUDIO》是专为独立女装主理人与买手店设计的 AI 时尚摄影工作台。面对高频的换季上新需求，主理人只需上传一张服装平铺原图，即可在「匀称 / 丰盈 / 纤细」三种体型、「自然 / 暖棕 / 深棕」三种包容性肤色，以及「奶油白影棚 / 城市街角 / 日光咖啡馆」三大场景间自由组合，生成具有杂志质感的模特上身大片。',
      '不同于盲目堆砌 AI 噱头的生成工具，《衣序》坚持「服装细节始终由你把关」：内置拍摄指令透明检视器、导出前必检的三大细节核对清单（领口与版型、纽扣与图案、颜色与面料），以及不虚构背面细节的 1800×1800 详情页九宫格排版画布，并配有 28 秒「同一模特 · 六套穿搭」交互式宣传片。'
    ],
    highlights: [
      '多元审美与杂志级布光：支持 3 种体型 × 3 种真实肤色 × 3 大拍摄场景与 2:3 竖图 / 1:1 主图画幅切换',
      '负责任的 AI 电商工作流：强制前置「领口版型 · 纽扣图案 · 颜色面料」人工核对流程，拒绝虚假买家秀',
      '1800×1800 详情页九宫格合成器：自动将上身成片、平铺原图与局部细节裁切编排为高分辨率商品详情大图',
      '内置 28 秒《ONE MODEL. SIX LOOKS.》交互式换装短片，直观呈现衬衫、开衫、大衣、连衣裙等六套秋冬成片'
    ],
    techStack: ['OpenAI Image Pipeline', 'Canvas 1800×1800 Compositor', 'Editorial Design System', 'Human-in-the-Loop QA', '28s Lookbook Film'],
    metrics: [
      { label: 'GRID OUTPUT', value: '1800 × 1800 PNG' },
      { label: 'LOOKBOOK FILM', value: '28s / 6 Outfits' },
      { label: 'QA CHECKLIST', value: '3-Point Verification' }
    ],
    praise: [
      {
        quote: '没有夸张的赛博霓虹，而是用温润的燕麦纸色与克制的编辑部排版，让 AI 工具真正融入独立服装品牌的审美语境。',
        source: 'EDITORIAL TECH REVIEW'
      }
    ]
  },
  {
    "id": "fx-vfx-studio",
    "films": [{ "title": "突破屏幕", "src": "/films/fx-film/index.html", "poster": "/films/fx-film/poster.svg", "duration": 16, "orientation": "landscape" }],
    "volume": "VOL. VII",
    "edition": "VFX EDITION · 2026",
    "title": "FX 特效工坊",
    "subtitle": "用前端图形学，为竖屏视频设计一次出场",
    "spineTitle": "FX 特效工坊 — 30 种图形特效与导演运镜",
    "category": "REALTIME VFX",
    "liveUrl": "https://fx.297782.xyz/",
    "coverImage": "/assets/covers/cover-fx.svg",
    "dimensions": {
      "width": 22.8,
      "height": 29.4,
      "thickness": 3.4
    },
    "palette": {
      "coverBg": "#38451d",
      "coverSecondary": "#d3f84f",
      "spineBg": "#273411",
      "spineText": "#f1f9d7",
      "foilColor": "#d3f84f",
      "pageEdge": "#ecf0e5",
      "accentHex": "#d3f84f",
      "detailBg": "#23300f"
    },
    "productDescription": "给一段竖屏视频，换一种电影感的出场方式。在 30 种实时特效之间切换，调整粒子、光影与转场，再用自动导演完成一段短片。",
    "productFeatures": [
      "30 种实时图形特效",
      "导入视频，调整特效强度与光标力场",
      "8 秒自动运镜与内录导出"
    ],
    "primaryStack": "Three.js",
    "techStack": [
      "Three.js",
      "GLSL",
      "Canvas 2D"
    ],
    "metrics": [
      {
        "label": "EFFECTS",
        "value": "30 scenes"
      },
      {
        "label": "FORMAT",
        "value": "9:16"
      }
    ],
    "legacyIds": [
      "shenghua-zjh-ecosystem"
    ],
    "author": "JIANG FENG",
    "year": "2026",
    "repoUrl": "https://github.com/jiangfengwhu",
    "tagline": "给一段竖屏视频，换一种电影感的出场方式。在 30 种实时特效之间切换，调整粒子、光影与转场，再用自动导演完成一段短片。",
    "synopsis": [
      "给一段竖屏视频，换一种电影感的出场方式。在 30 种实时特效之间切换，调整粒子、光影与转场，再用自动导演完成一段短片。"
    ],
    "highlights": [
      "30 种实时图形特效",
      "导入视频，调整特效强度与光标力场",
      "8 秒自动运镜与内录导出"
    ],
    "praise": []
  }
];

/**
 * Lusion-Style 3D Playing Card Capability Deck (`#about-capability`)
 * Aspect ratio: 314 / 438 (matching `.about-capability-card` from lusion.co)
 */
export const CAPABILITIES = [
  {
    id: 'cap-01',
    index: '01',
    suit: '♠',
    title: 'WebGL & 3D\nInteractive',
    subtitle: '空间叙事与实时渲染',
    accent: '#1a2ffb',
    description:
      '精通 Three.js、WebGL 2 InstancedMesh、自定义 GLSL 着色器与物理阻尼动画。将枯燥的网页升级为可旋转、可录制、可触摸的三维数字剧场。',
    deliverables: ['Three.js / WebGL 2 场景架构', '程序化纹理与 PBR 材质系统', 'Canvas 4K 视频流实时录制', '2D/3D 混合正交与透视相机调度']
  },
  {
    id: 'cap-02',
    index: '02',
    suit: '♦',
    title: 'AI-Native\nProduct Studio',
    subtitle: 'AI 落地工作台与多智能体',
    accent: '#ff2442',
    description:
      '拒绝玩具式 Demo，专注于将大模型、视觉生成（ComfyUI / OpenAI）与人工核对工作流深度结合，打造零门槛、高确定性的行业生产力工具。',
    deliverables: ['AI 电商摄影与九宫格合成器', 'LLM Gateway 与多 Agent 编排', 'ComfyUI 高并发算力服务 (Go)', '零成本 AI 内容生产与自动化流水线']
  },
  {
    id: 'cap-03',
    index: '03',
    suit: '♣',
    title: 'Cross-Platform\nContainers',
    subtitle: '动态宿主与跨端桥接架构',
    accent: '#c1ff00',
    description:
      '深入 React Native Codegen、Kotlin 原生壳与 Flutter WebView 容器底层，构建支持云端 Agent 动态交付、多路并发预热与安全沙盒隔离的宿主平台。',
    deliverables: ['生花 (ZJH) 动态宿主与 6 路预热池', 'Vibe Container 微应用沙盒工作台', 'window.AppRuntime 强类型 JS SDK', 'Swift macOS / iOS 原生效率工具']
  },
  {
    id: 'cap-04',
    index: '04',
    suit: '♥',
    title: 'Full-Stack &\nCreative Audio',
    subtitle: '高并发后端与程序化音画',
    accent: '#f59e0b',
    description:
      '从 Go 微服务、Cloudflare Workers 边缘计算，到纯代码 Web Audio API 实时电子乐合成器，打通全栈工程与多感官创意编程的每一处关节。',
    deliverables: ['Go 高并发微服务与分布式网关', 'Cloudflare Worker / R2 边缘架构', 'Web Audio 128BPM 实时合成器', '本地优先 (Local-First) 隐私架构']
  }
];

/**
 * SNS & Contact Matrix (`#footer-section` & `#header-menu`)
 */
export const SOCIAL_LINKS = [
  {
    id: 'github',
    label: 'GITHUB',
    handle: '@jiangfengwhu',
    url: 'https://github.com/jiangfengwhu',
    badge: '43 REPOS',
    description: '开源代码库、生花动态宿主、Vibe Container 与 Go/Swift 工具集'
  },
  {
    id: 'xiaohongshu',
    label: 'REDNOTE / 小红书',
    handle: '小苍AI干货 (ID: 94126430446)',
    url: PROFILE.xhsUrl,
    badge: 'CREATOR IP',
    description: '前大厂工程师 · 前沿 | 工具 | 数据 | 开发 | 可视化定制 · AI 落地提效'
  },
  {
    id: 'x',
    label: 'X / TWITTER',
    handle: '@jiangfengwhu202',
    url: 'https://x.com/jiangfengwhu202',
    badge: 'LET’S CONNECT',
    description: '关于开发、产品与独立创作，在 X 上聊聊'
  },
  {
    id: 'pindou',
    label: 'LAB 01 / 豆物',
    handle: 'pindou.297782.xyz',
    url: 'https://pindou.297782.xyz/',
    badge: 'WEBGL 3D',
    description: '相册里的喜欢，一颗颗立起来 — 图片转 3D 拼豆与图纸工坊'
  },
  {
    id: 'dazi',
    label: 'LAB 02 / 城市搭子',
    handle: 'dazi.297782.xyz',
    url: 'https://dazi.297782.xyz/',
    badge: 'SOCIAL APP',
    description: '一个人出门，也能刚好成局 — 3～5 人低压力同频小局体验'
  },
  {
    id: 'yixu',
    label: 'LAB 03 / 衣序 STUDIO',
    handle: 'yixu.297782.xyz',
    url: 'https://yixu.297782.xyz/',
    badge: 'AI FASHION',
    description: '好衣服，值得好好出镜 — 女装 AI 模特上身图与九宫格工作台'
  },
  {
    id: 'email',
    label: 'DIRECT INQUIRY',
    handle: '809740942@qq.com',
    url: 'mailto:809740942@qq.com',
    badge: 'LET’S TALK',
    description: 'AI 落地提效咨询、3D 交互定制开发与全栈技术合作'
  }
];
