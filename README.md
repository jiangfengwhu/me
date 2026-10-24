# Jiang Feng · 3D Portfolio

线上地址：https://me.297782.xyz

## 本地开发

使用 Node.js 22 或更新版本。

```sh
npm ci
npm run dev
```

## 发布到 Cloudflare

```sh
npx wrangler login
npm run deploy
```

`wrangler.jsonc` 配置 Cloudflare Workers 静态资源托管和 `me.297782.xyz` 自定义域名。
构建会生成拼豆动画资源，并从 `dist` 中移除动画编辑器缓存。账号凭据由 Wrangler 在本机保存，不存入仓库。

页面接入 `https://stats.297782.xyz/b.js` 统计脚本，使用 `defer` 加载。

产品介绍片的源码和素材位于 `public/films`，说明见该目录的 README。
