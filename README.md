# Gem Merge 2048 · 珠宝2048

手机优先的珠宝主题 2048 网页游戏。Vue 3 + TypeScript + Vite，无后端、无账号、无广告。全部宝石为本项目原创 SVG，运行时仅依赖 Vue，不请求外部图片、字体或分析服务。

## 项目结构

```text
src/
├── App.vue                  # 首页、游戏、图鉴和弹窗组合
├── main.ts                  # Vue 入口
├── styles.css               # 响应式界面与 CSS 动画
├── assets/gems/             # 11 颗原创切面 SVG 宝石
├── components/
│   ├── AppIcon.vue          # SVG 界面图标
│   ├── GemIcon.vue          # 宝石图形
│   ├── GameBoard.vue        # 棋盘、键盘/触摸/鼠标交互
│   └── ModalDialog.vue      # 弹窗、焦点管理
├── composables/useGame.ts   # 状态、动画时序、存档协调
└── game/
    ├── engine.ts            # 纯 2048 移动、合并、生成、结束规则
    ├── session.ts           # 对局、计分、胜利、撤销
    ├── storage.ts           # 存档校验与存储接口
    ├── gestures.ts          # 滑动方向与阈值
    └── gems.ts              # 名称、颜色、文案、素材映射
tests/
├── game.test.ts             # Node 内置测试，无额外测试依赖
└── browser.html             # 本地验收夹具，不进入生产构建
scripts/generate-gems.mjs    # 可复现的原创 SVG 生成脚本
public/favicon.svg
vercel.json
wrangler.jsonc
.github/workflows/pages.yml # GitHub Pages 自动构建和部署
```

## 安装与运行

推荐 Node.js 24 LTS，最低版本 22.12；项目提供 `.nvmrc`。没有 Node/npm 时先从 [Node.js 官网](https://nodejs.org/) 安装 LTS，重新打开终端。

```bash
npm install
npm run dev
```

打开终端显示的 Local 地址。开发服务器监听局域网，同 Wi-Fi 的手机可以打开终端中的 Network 地址试玩（需要电脑防火墙允许连接）。

```bash
npm test          # 规则、随机棋盘、完整对局、存档和手势测试
npm run build    # 先执行严格 TypeScript 检查，再构建到 dist/
npm run preview  # 预览生产构建
```

已提交 `package-lock.json`，自动部署使用 `npm ci` 以保持一致的依赖版本。

## 已实现

- 4×4 经典 2048，开局两颗珠宝；新珠宝 90% 为 2，10% 为 4。
- 只在有效移动后生成新珠宝；一颗宝石每步最多合并一次。
- 手机四向滑动、电脑方向键，也支持鼠标/触控笔拖动棋盘。
- 棋盘 `touch-action: none`，触摸移动使用 `preventDefault`；不妨碍棋盘以外的页面正常滚动。24px 阈值过滤轻触，多指/中断手势取消。
- 稳定 tile ID + CSS transform 实现平滑移动；新珠宝渐入、合成弹跳/闪光/粒子，高等级加强反馈。
- 当前分数、历史最高、当前最高珠宝、11种珠宝图鉴；未解锁为剪影。
- 每局一次撤销，恢复上一有效移动之前的棋盘与分数。刷新后撤销次数不会重置；历史最高分和已解锁图鉴不回退。
- 合成 2048 后庆祝并可继续到 4096 及以上；确认后刷新不会再次弹出同一局的胜利提示。
- 游戏结束弹窗、重新挑战、重新开始二次确认；结束时仍可使用尚未消耗的撤销。
- 安全区域、320px 小屏布局、横屏滚动、减少动态效果偏好、弹窗键盘焦点约束。

## 本地存档

键名为 `gem-merge-2048:v1`。一个带版本的 JSON 保存棋盘、分数、最高分、已解锁珠宝、结束/胜利状态、撤销使用状态和上一帧快照。每个有效操作立即保存最终逻辑状态，避免动画中关闭页面造成进度丢失。

存档加载时校验 ID、坐标、2 的幂、占位唯一性和快照格式，并重算结束状态。损坏存档会显示提示并准备新局；隐私模式或存储空间不足时仍可玩，但界面会提示无法持久保存。

存档仅属于当前浏览器和域名，不同步到其他手机、微信浏览器或不同部署域名。清除浏览器数据会清除进度。V1 图鉴记录“见过的珠宝”，因此随机生成的 4 也会点亮粉水晶。

## GitHub Pages 部署

- GitHub 仓库：[yuzu-fr/gem-merge-2048](https://github.com/yuzu-fr/gem-merge-2048)
- GitHub Pages：[珠宝2048试玩](https://yuzu-fr.github.io/gem-merge-2048/)

在本仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。推送到 `main` 后，`.github/workflows/pages.yml` 会自动安装依赖、运行规则测试、进行 TypeScript 检查并发布 `dist`；也可以在 Actions 页面手动运行。

GitHub Pages 使用 `/gem-merge-2048/` 子路径，工作流通过 `GITHUB_PAGES_BASE` 自动按仓库名设置。Vercel、Cloudflare 和本地开发默认仍使用 `/`，各平台独立部署。参考 [Vite 官方 Pages 指南](https://vite.dev/guide/static-deploy#github-pages)。

本地复验 GitHub Pages 构建：

```bash
GITHUB_PAGES_BASE=/gem-merge-2048/ npm run build
GITHUB_PAGES_BASE=/gem-merge-2048/ npm run preview
# 打开 http://localhost:4173/gem-merge-2048/
```

更新 Vercel / Cloudflare 前直接运行 `npm run build`，生成根路径版本。不同平台域名下的游戏存档独立。

## Cloudflare Pages 部署

当前 Cloudflare 备用站点：[珠宝2048备用链接](https://gem-merge-2048-yuzu.pages.dev/)。现有 Vercel 主站继续保留，两个站点独立部署。部署记录和指定账号/项目的更新命令见 [DEPLOYMENT.md](DEPLOYMENT.md)。

本项目使用现有 Vue/Vite 生产构建直接部署到 Cloudflare Pages，无需改动游戏逻辑。项目已提供 `wrangler.jsonc`，项目名为 `gem-merge-2048-yuzu`，输出目录为 `dist`。参考 [Cloudflare Vue 部署文档](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vue-site/)。

### 最快试玩：上传构建包

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，进入 **Workers & Pages → Create application → Pages**，选择 **Drag and drop / Upload assets**。
2. 本次项目 `gem-merge-2048-yuzu` 已创建。更新时进入此项目，选择 **Create deployment → Production**；在其他账号首次部署时才需要新建项目。
3. 上传已准备的 `releases/gem-merge-2048-cloudflare.zip`，然后部署。ZIP 根目录直接包含 `index.html` 和 `assets/`。
4. 打开控制台返回的 `pages.dev` 地址，并用未登录浏览器和手机确认可以直接试玩。

上传包对应生成时的源码。以后修改游戏后，先重新运行 `npm run build`，再上传新的 `dist` 内容。

### 自动更新：连接 Git 仓库

在 Pages 选择 **Import an existing Git repository**，连接本项目仓库，设置：

| 设置 | 值 |
| --- | --- |
| 生产分支 | 你的实际主分支，例如 `main` |
| 根目录 | 项目根目录 |
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |
| Node.js 版本 | `24`（项目 `.nvmrc` 已设置；也可设置构建环境变量 `NODE_VERSION=24`） |

如果打算长期自动部署，建议一开始就选择 Git 集成。Cloudflare 的 Direct Upload 项目不能原地切换为 Git 集成，需要新建项目。[官方说明](https://developers.cloudflare.com/pages/get-started/direct-upload/)

### 命令行上传

```bash
npm run build
npx wrangler login
# 更新已经创建的备用项目，不重复创建
CLOUDFLARE_ACCOUNT_ID=2baf7a522d87475266806e9339fd88ca npx wrangler pages deploy dist --project-name=gem-merge-2048-yuzu --branch=main
```

首次登录需在浏览器完成 Cloudflare 授权；不要把账号密码或 API Token 发到聊天中。如果更换项目名，同时更新 `wrangler.jsonc` 中的 `name` 和上述命令。Wrangler 只在部署时通过 `npx` 使用，不增加游戏运行时依赖。

Cloudflare 域名与 Vercel 域名使用不同的 localStorage，原域名的进度不会自动迁移。自定义域名可以在 Pages 项目的 **Custom domains** 中配置。

## Vercel 部署

当前正式站点：[珠宝2048](https://gem-merge-2048-yuzu.vercel.app/)。已认领到你的 Vercel 账号，后续更新同一项目的准确命令见 [DEPLOYMENT.md](DEPLOYMENT.md)。

配置已经包含框架 `vite`、安装命令 `npm ci`、构建命令 `npm run build`、输出目录 `dist`，无环境变量或数据库。网站不使用路径路由，无需 SPA 重写。详见 [Vercel 的 Vite 部署说明](https://vercel.com/docs/frameworks/frontend/vite) 和 [构建配置文档](https://vercel.com/docs/builds/configure-a-build)。

### 方式一：从 Git 仓库部署

1. 将项目推送到你自己的 GitHub / GitLab / Bitbucket 仓库。
2. 登录 Vercel，选择 **Add New → Project**，导入仓库。
3. Root Directory 选择本项目根目录，Framework Preset 选择 **Vite**，Node.js 选择 **24.x**。
4. 保持上述构建配置，点击 **Deploy**；完成后获得 `https://…vercel.app` 地址。
5. 使用未登录浏览器验证访问。如项目启用了访问保护，在项目 Deployment Protection 中按你的分享范围配置，确保朋友打开无需登录。

### 方式二：Vercel CLI

```bash
npx vercel login
npx vercel --prod
```

按提示选择自己的账号/团队，项目名使用 `gem-merge-2048` 或其他英文小写名称，根目录保持 `./`。

当前 CLI 也提供无需登录的临时部署：

```bash
npx vercel deploy --temporary
```

临时地址适合短期试玩，不等于账号下的长期生产部署；以 CLI 返回的到期时间、认领链接和限制为准。若本次已生成临时链接，其状态会记录在 `DEPLOYMENT.md`。

### 微信试玩

把公开 HTTPS 链接直接发送给朋友即可。Demo 不接入微信 JS-SDK，分享卡片的封面与文案由微信决定，暂不支持自定义分享卡片。网页已设置中文标题、描述和 favicon。

发布后仍需用真实 iPhone / Android 的微信内置浏览器各做一轮验收：四向连续滑动、前后台切换、刷新恢复、小屏安全区、弹窗和长局性能。桌面浏览器的尺寸模拟与事件测试不能替代真实设备。域名在试玩者网络下的可达性也应实际确认。

## 测试与复验

`npm test` 共 15 组用例，覆盖：

- `[2,2,2,2] → [4,4,0,0]`、`[2,2,4,0] → [4,4,0,0]`，方向遍历与不跨级连合。
- 无效移动不调用随机数、不生成宝石；90/10 概率边界。
- 满盘死局、横向/纵向可合并、生成后结束、结束后撤销。
- 分数、最高分、图鉴、单次撤销、2048 继续游戏。
- 存档完整往返、刷新后的撤销限制、损坏数据和存储异常。
- 500 个随机棋盘 × 四个方向的数值守恒、合并计分、唯一位置检查。
- 20 局随机完整游戏运行到结束，并检查新局保留收藏与最高分。

启动开发服务器后，打开 `/tests/browser.html`，可加载合并/胜利/结束场景并运行七项触摸组件集成检查。夹具备份该域名的原存档，测试结束请点击“恢复原存档”。使用 `127.0.0.1` 测试可与 `localhost` 的日常存档隔离。该 HTML 不在 Vite 生产构建入口内，不会发布。

安全审计：运行时依赖可用 `npm audit --omit=dev` 单独检查。当前开发工具链的 `picomatch` 存在上游 ReDoS 审计提示（最新 4.0.7 尚无修复版）；它仅参与本地构建/类型检查，不进入游戏运行代码。不要使用 `npm audit fix --force` 盲目降级整个工具链；待上游修复后更新锁文件并重新运行测试。

## 后续扩展与微信小游戏迁移

`engine.ts` 和 `session.ts` 不依赖 Vue、DOM 或 localStorage，可直接复用；随机数已通过函数参数注入，便于每日挑战采用确定性种子。`StoragePort` 可以适配 `wx.getStorageSync / wx.setStorageSync`。微信小游戏需要将 Vue/DOM 界面替换为 Canvas 或小游戏引擎渲染，接入其输入与生命周期；网页组件不能直接当作小游戏渲染层运行。

订单、金币、道具、广告和排行榜可在成功 `playTurn` 后由应用层添加，不需要改动基础合并规则。皮肤可以替换 `gems.ts` 的素材映射。当前版本不预置服务端、付费 SDK 或复杂插件系统。

## 素材

`src/assets/gems/*.svg`、`public/favicon.svg` 与界面 SVG 图标均为本项目原创程序化矢量图，可随本项目使用、修改和商用，不依赖外部图库或系统珠宝 Emoji。运行 `node scripts/generate-gems.mjs` 可重新生成宝石和 favicon。
