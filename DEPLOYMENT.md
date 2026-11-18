# 部署记录

## GitHub Pages

- 独立源码仓库：[yuzu-fr/gem-merge-2048](https://github.com/yuzu-fr/gem-merge-2048)，公开仓库，主分支 `main`。
- 试玩地址：[https://yuzu-fr.github.io/gem-merge-2048/](https://yuzu-fr.github.io/gem-merge-2048/)。
- 配置：仓库 **Settings → Pages → Source → GitHub Actions**。
- 工作流：`.github/workflows/pages.yml`，Node.js 24，运行 `npm ci`、`npm test`、`npm run build`，发布 `dist`。
- 资源路径：工作流设置 `GITHUB_PAGES_BASE=/gem-merge-2048/`，使 JS、CSS 和 favicon 适配 GitHub Pages 子目录；其他平台默认 `/`。
- 以后只需向本仓库 `main` 推送更新，或在本仓库 Actions 页面手动运行部署。此工作流不会更新 Vercel 或 Cloudflare。
- 操作范围仅限这个新建 GitHub 仓库；现有 Vercel、Cloudflare 和其他项目保留。
- 每个托管域名的 localStorage 独立。默认 `github.io` 地址无需购买域名；大陆网络访问效果仍需实测。

## Vercel 主站

- 正式试玩地址：[https://gem-merge-2048-yuzu.vercel.app](https://gem-merge-2048-yuzu.vercel.app)
- 平台：Vercel，已于 2026-11-18 将原临时部署认领到 `yuzu's projects`。
- 珠宝2048对应的 Vercel 项目名：`racing-topaz-j8rwjyq`（沿用临时部署生成的项目名）。
- 项目控制台：[打开珠宝2048项目](https://vercel.com/yuzus-projects-0cf0a3b2/racing-topaz-j8rwjyq)
- 生产部署 ID：`dpl_9bJ8RhzmGAcxvLP27zn8uQZxdZdD`。
- 状态：Production / Ready，正式域名显示 Valid Configuration。
- 验证：不带登录 Cookie 的 HTTPS 请求返回 HTTP 200；页面标题正确，JS/CSS 文件名与本地已测试的生产构建完全一致。

这是账号下的正式项目，已完成认领，不再使用原匿名部署的一小时有效期。`vercel.app` 地址由平台提供，无需购买域名。原 `racing-topaz-j8rwjyq.tmp.now` 也仍绑定在本项目；后续分享优先使用上面的正式地址。

本次只认领珠宝2048项目并给它添加生产域名，没有修改账号中的其他项目或账号级设置。

## 后续更新 Vercel 主站

网页登录与 CLI 登录分别管理。本次通过已登录的 Vercel 网页完成认领；本机 CLI 尚未登录。以后通过 CLI 更新时，在本项目目录执行：

```bash
npx vercel login
npx vercel deploy --prod --project racing-topaz-j8rwjyq --scope yuzus-projects-0cf0a3b2 --yes
```

命令明确指定本项目及所属团队，避免误部署到其他项目。不要再使用 `--temporary`。

部署内容为 Vue/Vite 生产构建；`npm ci`、TypeScript 检查与 `npm run build` 已通过。两种域名的 localStorage 相互独立，旧域名的进度不会自动迁移到新地址。

当前没有在真实 iPhone/Android 微信中完成真机验收；已完成浏览器响应式布局、触摸事件集成、键盘、刷新恢复、胜利与结束场景验证。

## Cloudflare 备用站

- 备用试玩地址：[https://gem-merge-2048-yuzu.pages.dev](https://gem-merge-2048-yuzu.pages.dev)
- 平台：Cloudflare Pages，2026-11-18 通过已登录的控制台 Direct Upload 新建并发布。
- 项目名：`gem-merge-2048-yuzu`；生产分支：`main`。
- 项目控制台：[打开珠宝2048备用项目](https://dash.cloudflare.com/2baf7a522d87475266806e9339fd88ca/pages/view/gem-merge-2048-yuzu)
- 部署 ID：`3e54b427-00df-414f-8062-6c633bb8c124`。
- 上传文件：`releases/gem-merge-2048-cloudflare.zip`，包含 `index.html`、favicon、JS 和 CSS，共 4 个文件。
- 验证：Cloudflare 与 Vercel 的全部 4 个文件分别返回 HTTP 200，内容 SHA-256 均与本地生产构建一致；Cloudflare 页面图片加载成功，无浏览器脚本错误。
- 作用范围：只新增这个 Cloudflare 项目，未修改 Vercel 部署、域名、账号设置或任何其他项目。

两个站点的本地存档分别保存在各自域名下，不自动同步。大陆网络访问效果尚需国内朋友实测。

### 后续只更新 Cloudflare 备用站

在 Cloudflare 控制台进入上述项目，选择 **Create deployment → Production**，上传新构建的 ZIP。CLI 也可以精确指定当前账号与项目：

```bash
npm run build
npx wrangler login
CLOUDFLARE_ACCOUNT_ID=2baf7a522d87475266806e9339fd88ca npx wrangler pages deploy dist --project-name=gem-merge-2048-yuzu --branch=main
```

本次通过网页完成部署，本机 Wrangler 尚未登录。不要重新创建项目，也不要使用临时部署参数。更新 Cloudflare 不会自动更新 Vercel；需要两边内容一致时，应分别发布同一份构建产物。
