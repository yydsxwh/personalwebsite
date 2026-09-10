# 把 xiaowenhua.net 绑到香港 Ubuntu 并上线

目标机器：`47.242.157.181`（Ubuntu 22.04）。个人站走 **3001** 端口，不占用旧站常用的 3000。

## 你需要在阿里云点的两步

### 1. 域名解析（xiaowenhua.net）

域名控制台 → 解析设置，各加一条：

| 主机记录 | 类型 | 记录值 |
|---------|------|--------|
| `@` | A | `47.242.157.181` |
| `www` | A | `47.242.157.181` |

TTL 用 10 分钟即可。用 `ping xiaowenhua.net` 看到这个 IP 再申请证书。

### 2. 安全组

香港实例入方向放行 **TCP 80、443**（SSH 22 保持已有规则）。

## 在服务器上执行

用控制台「远程连接」登录后：

```bash
curl -fsSL https://raw.githubusercontent.com/yydsxwh/personalwebsite/cursor/andyyyds-persona-product-d26b/deploy/setup-on-server.sh | sudo bash
```

代码目前在分支 `cursor/andyyyds-persona-product-d26b`（尚未合并 main）。脚本默认拉这个分支。

脚本会：安装 Node 20 / Nginx、拉代码、建 SQLite、编译、用 systemd 常驻、配好 Nginx。DNS 已指向本机时会自动申请 Let's Encrypt 证书。

## 更新代码

```bash
cd /var/www/xiaowenhua/app
sudo git pull
sudo npm install
sudo npx prisma db push
sudo npm run build
sudo systemctl restart xiaowenhua
```

不要在生产环境运行 `npm run db:reset`。
