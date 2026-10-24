/**
 * ============================================================================
 * ACT I BULLETIN BOARD — CARD CONTENT
 * ============================================================================
 * Six rounded 3D cards pinned to the Act I board. Kept in its own module so the
 * exact same copy feeds both the WebGL scene (`NightStreetScene`) and the
 * `_cards.html` texture preview harness.
 *
 * Layouts understood by `createBulletinCardTexture`:
 *   `profile` — avatar + name rail + bio + WORKED AT plates + STACK icon row
 *   `github`  — real 53-week contribution calendar + snake + languages + medals
 *   `icon`    — one oversized "far away" mark + crisp badge + copy block
 * ============================================================================
 */

import { GITHUB_ACTIVITY } from './portfolioConfig.js';
import githubSnapshot from './githubSnapshot.json' with { type: 'json' };

export function createBulletinCardConfigs(profile) {
  return [
    /* ---------------------------------------------- 01 · profile ------ */
    {
      id: 'bulletin-profile',
      layout: 'profile',
      w: 28.4,
      h: 15.0,
      d: 0.46,
      x: -14.8,
      y: 9.9,
      z: -8.25,
      kicker: 'EX-FRONTEND → INDEPENDENT MAKER',
      badge: 'OPEN TO BUILD',
      title: 'JIANG FENG',
      role: '@jiangfengwhu · Independent Developer',
      body: '从前端出发，在小米、快手做过 React Native、Web、低代码与 D2C，也写 Go、Node.js 服务端，做过 iOS App。现在独立开发，把想法做成可用的产品。',
      companies: [
        { icon: 'mi', label: 'XIAOMI', color: '#ff6900' },
        { icon: 'kuaishou', label: 'KUAISHOU', color: '#ff5000' }
      ],
      stack: [
        { icon: 'rn', label: 'React Native' },
        { icon: 'web', label: 'Web' },
        { icon: 'go', label: 'Golang' },
        { icon: 'node', label: 'Node.js' },
        { icon: 'ios', label: 'iOS' },
        { icon: 'lowcode', label: 'Low-code · D2C' }
      ],
      footerLeft: 'FROM IDEA TO PRODUCT',
      footerRight: '',
      accentHex: '#38bdf8',
      bgTint: '#1c2331',
      pinColor: '#38bdf8',
      avatarUrl: profile.avatar,
      url: profile.githubUrl
    },

    /* ----------------------------------------------- 02 · github ------ */
    {
      id: 'bulletin-github',
      layout: 'github',
      w: 28.4,
      h: 15.0,
      d: 0.46,
      x: 14.8,
      y: 9.9,
      z: -8.25,
      contrib: GITHUB_ACTIVITY,
      languages: GITHUB_ACTIVITY.languages,
      achievements: githubSnapshot.achievements,
      footerLeft: 'GITHUB.COM/JIANGFENGWHU',
      footerRight: 'VISIT ↗',
      accentHex: '#39d353',
      bgTint: '#151d18',
      pinColor: '#39d353',
      url: profile.githubUrl
    },

    /* -------------------------------------------------- 03 · X -------- */
    {
      id: 'bulletin-x',
      layout: 'icon',
      icon: 'x',
      iconBackground: '#101010',
      iconForeground: '#ffffff',
      w: 13.6,
      h: 14.8,
      d: 0.46,
      x: -21.6,
      y: -6.8,
      z: -8.25,
      kicker: 'X / TWITTER',
      title: '@jiangfengwhu202',
      body: '关于开发、产品与独立创作，在 X 上聊聊。',
      meta: 'LET’S CONNECT',
      footerLeft: 'X.COM',
      footerRight: 'FOLLOW ↗',
      accentHex: '#e7e9ea',
      bgTint: '#1b1e24',
      pinColor: '#e7e9ea',
      url: profile.xUrl
    },

    /* -------------------------------------------- 04 · 小红书 -------- */
    {
      id: 'bulletin-xhs',
      layout: 'icon',
      icon: 'xhs',
      iconBackground: '#ff2442',
      iconForeground: '#ffffff',
      w: 13.6,
      h: 14.8,
      d: 0.46,
      x: -7.2,
      y: -6.8,
      z: -8.25,
      kicker: 'REDNOTE / 小红书',
      title: '小苍AI干货',
      body: '分享 AI 工具与开发实践，把技术用到日常创作里。',
      meta: 'AI · TOOLS · MAKING',
      footerLeft: 'ID 94126430446',
      footerRight: 'OPEN ↗',
      accentHex: '#ff2e4d',
      bgTint: '#241a1e',
      pinColor: '#ff2e4d',
      url: profile.xhsUrl
    },

    /* ----------------------------------------------- 05 · email ------ */
    {
      id: 'bulletin-mail',
      layout: 'icon',
      icon: 'mail',
      iconBackground: '#216bff',
      iconForeground: '#ffffff',
      w: 13.6,
      h: 14.8,
      d: 0.46,
      x: 7.2,
      y: -6.8,
      z: -8.25,
      kicker: 'EMAIL / DIRECT',
      title: '809740942@qq.com',
      body: '合作、咨询，或者只是想聊聊 3D 和 AI，直接写信给我。',
      meta: 'LET’S BUILD SOMETHING',
      footerLeft: 'MAILTO',
      footerRight: 'WRITE ↗',
      accentHex: '#78aaff',
      bgTint: '#182130',
      pinColor: '#78aaff',
      url: 'mailto:809740942@qq.com'
    },

    /* ------------------------------------------- 06 · portfolio ------ */
    {
      id: 'bulletin-portfolio',
      layout: 'icon',
      icon: 'shelf',
      iconBackground: '#77533b',
      iconForeground: '#fff2d9',
      w: 13.6,
      h: 14.8,
      d: 0.46,
      x: 21.6,
      y: -6.8,
      z: -8.25,
      kicker: 'PORTFOLIO / ACT II',
      title: '七卷典藏',
      body: 'VOL. I – VII 牛皮纸精装书架，可抽拉、可 360° 翻转检视。',
      meta: '7 WORKS · LIVE + OPEN SOURCE',
      footerLeft: 'ACT II BOOKSHELF',
      footerRight: 'ENTER →',
      accentHex: '#d4af79',
      bgTint: '#252019',
      pinColor: '#d4af79',
      action: 'goto-act2'
    }
  ];
}
