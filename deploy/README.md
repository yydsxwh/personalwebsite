# 香港机：一把钥匙，多个独立站

目标机器：`47.242.157.181`（Ubuntu 22.04）。**同一把 SSH 钥匙**放进 Cursor My Secrets 后，不同仓库的 Cloud Agent 都能登录这台机，但每个网站必须用自己的目录、数据库、上传目录和端口，不能互相拷 `prod.db` / `uploads` / `.env`。

## 已经占用的站

| 站点 | 域名 | 端口 | 目录 | 仓库 |
|------|------|------|------|------|
| Andyyyds 主站 | `yydsxwh.com` | 3000 | `/var/www/yyds-course-platform` | `yydsxwh/Andyyyds` |
| 自己的个人站 | `xiaowenhua.net` | 3001 | `/var/www/xiaowenhua` | `yydsxwh/personalwebsite` |
| 客户站 | `zhouyuding0825.com` | 3002 | `/var/www/zhouyuding0825` | 同上，独立实例 |

下一个新产品 / 下一家客户用 **3003 起**，`SITE_ID` 用小写目录名，例如 `valorant`、`account`。

## Cursor My Secrets（一次配置，多库复用）

打开 [Cloud Agents Secrets](https://cursor.com/dashboard/cloud-agents)，在 **My Secrets**（用户级）里加下面三项。若某个仓库用了单独的 Environment，再在那个环境里同样加一遍——环境级密钥不会自动带到别的环境。

| 名称 | 类型 | 值 |
|------|------|-----|
| `DEPLOY_HOST` | Environment Variable | `47.242.157.181` |
| `DEPLOY_USER` | Environment Variable | `root` |
| `DEPLOY_SSH_KEY` | **Runtime Secret** | 私钥全文（`BEGIN OPENSSH PRIVATE KEY` 到 `END`，换行保留） |

改密钥后必须**新开一个 Cloud Agent**，正在跑的对话读不到新钥匙。

私钥只放 Secrets，不要提交到任何 git 仓库。公钥可以公开，需要写进服务器：

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOnoSIzmgruj6YEcUuhotrh0mfQ5v79r7dJb13iEK2kp cursor-hk-deploy
```

阿里云「远程连接」以 root 执行一次（只加钥匙，不动网站）：

```bash
curl -fsSL https://raw.githubusercontent.com/yydsxwh/personalwebsite/cursor/hk-dual-site-deploy-b133/deploy/add-agent-key.sh | sudo bash
```

你自己另造了一把时，把 `.pub` 整行赋给 `AGENT_PUBKEY` 再跑同一条命令。

## 不同仓库怎么各部署各的站

钥匙只负责登录。隔离靠目录和端口：

```bash
# 本仓库：自己的站
sudo bash deploy/setup-on-server.sh

# 本仓库：再给一家客户装一套（不要和 xiaowenhua 混）
SITE_ID=zhouyuding0825 DOMAIN=zhouyuding0825.com PORT=3002 \
  sudo -E bash deploy/install-site.sh

# 别的产品仓库：SSH 上去后只动自己的目录，例如
#   /var/www/valorant     3003
#   /var/www/account      3004
# 不要进 /var/www/xiaowenhua 或 /var/www/yyds-course-platform
```

Cloud Agent 已注入密钥时：

```bash
bash deploy/push-from-agent.sh
```

一把 SSH 钥匙能进整台机器，所以脚本必须写死「只改自己的目录」。不要在 Agent 里对别的产品做 `rm -rf /var/www`。

## 两个个人站一键更新

```bash
curl -fsSL https://raw.githubusercontent.com/yydsxwh/personalwebsite/cursor/hk-dual-site-deploy-b133/deploy/setup-both-sites.sh | sudo bash
```

- 已有 `prod.db` 不重置
- 不改 Andyyyds 主站
- DNS 已指向本机时申请 Let's Encrypt

## 域名解析

| 主机记录 | 类型 | 记录值 |
|---------|------|--------|
| `@` | A | `47.242.157.181` |
| `www` | A | `47.242.157.181` |

`xiaowenhua.net` 已生效。`zhouyuding0825.com` 仍是 NXDOMAIN 时，本机 3002 可以在跑，但外网打不开这个域名。

安全组放行 **TCP 80、443**。

## 只更新其中一家

```bash
cd /var/www/xiaowenhua/app
sudo git fetch origin && sudo git checkout cursor/hk-dual-site-deploy-b133
sudo git pull --ff-only origin cursor/hk-dual-site-deploy-b133
sudo npm install && sudo npx prisma db push && sudo npm run build
sudo systemctl restart xiaowenhua
```

客户站把目录和服务名换成 `/var/www/zhouyuding0825`、`zhouyuding0825`。不要在生产跑 `npm run db:reset`。
