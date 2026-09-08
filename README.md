# personalwebsite

Andyyyds 个人 IP 展示站。源码从 [yydsxwh/Andyyyds](https://github.com/yydsxwh/Andyyyds) 的 `@andyyyds/person` 完整迁出，方便后续独立成软件产品。

## 功能

- 个人介绍首页（档案、精选、项目、博客、作品、荣誉、生活）
- 项目 / 博客 / 作品 / 简历 / 视频介绍 / 相册详情
- 自媒体同步：B 站、抖音、小红书、视频号投稿与合集
- 独立后台 `/person-admin`：档案、栏目条目、附件上传
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
