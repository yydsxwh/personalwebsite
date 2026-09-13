# personalwebsite

Andyyyds 个人 IP 展示站。源码从 [yydsxwh/Andyyyds](https://github.com/yydsxwh/Andyyyds) 的 `@andyyyds/person` 完整迁出，方便后续独立成软件产品。

## 功能

- 个人介绍首页（档案、精选、项目、博客、作品、荣誉、生活）
- 项目 / 博客 / 作品 / 简历 / 视频介绍 / 相册详情
- 自媒体同步：B 站、抖音、小红书、视频号投稿与合集
- 独立后台 `/person-admin`：档案、栏目名称、栏目条目、附件上传
- 投稿同步后台 `/studio/person-social`

## 技术栈

- Next.js 16 + TypeScript + Tailwind CSS
- Prisma + SQLite
- `@andyyyds/person` 个人 IP 产品包
- `@andyyyds/shared` 登录、权限、存储（从主站一并迁出，保证功能完整）

## 快速开始

```bash
npm install
npm run db:reset
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)（会跳到 `/about/person`）。

首次初始化时，档案里的姓名、介绍、邮箱、网站等字段都是空的，不会预填任何人的个人信息。请在「档案与联系方式」里自己填写。

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 站长 | admin@yyds.local | 123456 |

## 目录

```
packages/person     个人 IP 产品（页面、后台、同步、校验）
packages/shared     登录 / 权限 / 数据库 / 上传
src/app             路由薄入口（URL 与主站一致）
prisma              数据模型（含主站其余表，便于整包迁出；本产品只用 Person* / User / SiteSettings）
```

## 以后独立成产品

1. 本仓库已经能单独跑个人站，不必再依赖 Andyyyds 主站。
2. 继续拆时，可把 Prisma 收成 `PersonProfile` / `PersonEntry` / `PersonSocial*` / `User` / `SiteSettings.personSocialJson`。
3. 换域名只改 `NEXT_PUBLIC_SITE_URL` 和内容，不必改页面代码。

## 香港机上线（两个个人站）

同一台 `47.242.157.181` 上：`xiaowenhua.net` 是自己的站，`zhouyuding0825.com` 是客户站，数据和上传目录完全分开。Andyyyds 主站 `yydsxwh.com` 不要动。

Cursor **My Secrets** 放一把 SSH 私钥（`DEPLOY_SSH_KEY`），每个仓库的 Cloud Agent 都能登录这台机，再按各自目录/端口部署，互不串数据。先加钥匙：

```bash
curl -fsSL https://raw.githubusercontent.com/yydsxwh/personalwebsite/cursor/hk-dual-site-deploy-b133/deploy/add-agent-key.sh | sudo bash
```

两个个人站一起更新：

```bash
curl -fsSL https://raw.githubusercontent.com/yydsxwh/personalwebsite/cursor/hk-dual-site-deploy-b133/deploy/setup-both-sites.sh | sudo bash
```

详见 [deploy/README.md](deploy/README.md)。
