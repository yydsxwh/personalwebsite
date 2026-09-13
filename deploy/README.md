# 香港机双站部署

目标机器：`47.242.157.181`（Ubuntu 22.04）。同一台机器跑三套互不干扰的站点：

| 站点 | 域名 | 端口 | 目录 | 进程 |
|------|------|------|------|------|
| Andyyyds 主站（已有，不要动） | `yydsxwh.com` / `www.yydsxwh.com` | 3000 | `/var/www/yyds-course-platform` | 原 Node / pm2 |
| 自己的个人站 | `xiaowenhua.net` / `www` | 3001 | `/var/www/xiaowenhua` | `xiaowenhua` |
| 客户站 | `zhouyuding0825.com` / `www` | 3002 | `/var/www/zhouyuding0825` | `zhouyuding0825` |

一家客户 = 一个目录 + 一个 SQLite + 一份上传文件 + 一个端口。不要拷 `prod.db` / `uploads` / `.env`。

## 一键把两个个人站都上线

阿里云控制台打开这台香港机的「远程连接」，以 root 执行：

```bash
curl -fsSL https://raw.githubusercontent.com/yydsxwh/personalwebsite/cursor/hk-dual-site-deploy-b133/deploy/setup-both-sites.sh | sudo bash
```

脚本会：

1. 写入 Cloud Agent 部署公钥（方便以后 SSH）
2. 安装/更新 `xiaowenhua.net`（已有数据不重置）
3. 安装/更新 `zhouyuding0825.com`（独立库，不和自己的站混用）
4. DNS 已指向本机时申请 Let's Encrypt

不要动 `/var/www/yyds-course-platform`。

Cloud Agent 里若已配置 `DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_SSH_KEY`：

```bash
bash deploy/push-from-agent.sh
```

单站脚本仍可用：`deploy/setup-on-server.sh`（自己的站）、`deploy/install-site.sh`（客户站）。

## 域名解析

两个个人站都指到同一台香港 IP：

| 主机记录 | 类型 | 记录值 |
|---------|------|--------|
| `@` | A | `47.242.157.181` |
| `www` | A | `47.242.157.181` |

- `xiaowenhua.net`：解析已生效，HTTPS 应已可用。
- `zhouyuding0825.com`：必须先能 `ping` 到 `47.242.157.181`，脚本才会申请证书。域名还没注册或 nameserver 未生效时是 `NXDOMAIN`，站已经在本机 3002 跑着，只是外网打不开这个域名。

安全组放行 **TCP 80、443**（SSH 22 保持已有规则）。

## 以后只更新其中一家

```bash
# 自己的站
cd /var/www/xiaowenhua/app
sudo git fetch origin
sudo git checkout cursor/hk-dual-site-deploy-b133
sudo git pull --ff-only origin cursor/hk-dual-site-deploy-b133
sudo npm install
sudo npx prisma db push
sudo npm run build
sudo systemctl restart xiaowenhua
```

```bash
# 客户站（不要进 xiaowenhua 目录）
cd /var/www/zhouyuding0825/app
sudo git fetch origin
sudo git checkout cursor/hk-dual-site-deploy-b133
sudo git pull --ff-only origin cursor/hk-dual-site-deploy-b133
sudo npm install
sudo npx prisma db push
sudo npm run build
sudo systemctl restart zhouyuding0825
```

不要在生产环境运行 `npm run db:reset`。
