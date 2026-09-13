#!/usr/bin/env bash
# 在香港 Ubuntu 服务器上安装/更新 xiaowenhua.net 个人站。
# 用法（root）：
#   curl -fsSL https://raw.githubusercontent.com/yydsxwh/personalwebsite/main/deploy/setup-on-server.sh | bash
# 或把仓库拉下来后：
#   sudo bash deploy/setup-on-server.sh

set -euo pipefail

DOMAIN="xiaowenhua.net"
APP_DIR="/var/www/xiaowenhua/app"
DATA_DIR="/var/www/xiaowenhua/data"
REPO="https://github.com/yydsxwh/personalwebsite.git"
BRANCH="${DEPLOY_BRANCH:-cursor/hk-dual-site-deploy-b133}"
PORT="3001"
EMAIL="yydsxwh@gmail.com"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "请用 root 运行：sudo bash $0"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git curl ca-certificates nginx python3-certbot-nginx

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -qE '^v(2[0-9]|[3-9])'; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

mkdir -p "$APP_DIR" "$DATA_DIR"
if [[ -d "$APP_DIR/.git" ]]; then
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
else
  git clone --branch "$BRANCH" "$REPO" "$APP_DIR"
fi

cd "$APP_DIR"

if [[ ! -f .env ]]; then
  SECRET="$(openssl rand -base64 48 | tr -d '\n')"
  cat > .env <<EOF
NODE_ENV=production
AUTH_SECRET="${SECRET}"
DATABASE_URL="file:${DATA_DIR}/prod.db"
NEXT_PUBLIC_SITE_URL="https://${DOMAIN}"
EOF
  chmod 600 .env
fi

npm install
npx prisma db push
USER_COUNT="$(npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.user.count().then((n) => { console.log(n); return p.\$disconnect(); })")"
if [[ "${USER_COUNT}" == "0" ]]; then
  npx tsx prisma/seed.ts
fi

npm run build

install -m 644 "$APP_DIR/deploy/xiaowenhua.service" /etc/systemd/system/xiaowenhua.service
install -m 644 "$APP_DIR/deploy/nginx-xiaowenhua.conf" /etc/nginx/sites-available/xiaowenhua.net
ln -sfn /etc/nginx/sites-available/xiaowenhua.net /etc/nginx/sites-enabled/xiaowenhua.net
nginx -t
systemctl daemon-reload
systemctl enable --now xiaowenhua
systemctl reload nginx

if curl -fsS --max-time 8 "http://127.0.0.1:${PORT}/about/person" >/dev/null; then
  echo "本机 3001 端口已通。"
else
  echo "警告：本机 3001 尚未响应，用 journalctl -u xiaowenhua -n 50 查看日志。"
fi

if host "$DOMAIN" | grep -q "47.242.157.181"; then
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || \
    echo "证书申请失败：确认 DNS 已指向 47.242.157.181 后再运行 certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
else
  echo "DNS 还没指到本机，先跳过 HTTPS。解析生效后执行："
  echo "  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m ${EMAIL} --redirect"
fi

echo
echo "完成。HTTP 预览：http://${DOMAIN} 或 http://47.242.157.181:80 （需安全组放行 80）"
echo "后台：/login   默认 admin@yyds.local / 123456 （上线后立刻改密码）"
echo "进程：systemctl status xiaowenhua"
