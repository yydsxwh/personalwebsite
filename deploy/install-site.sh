#!/usr/bin/env bash
# 给「一家客户」装一套互不串数据的个人站。
# 必须传入 SITE_ID、DOMAIN、PORT。不会写入 /var/www/xiaowenhua。
#
# 例：
#   SITE_ID=zhouyuding0825 DOMAIN=zhouyuding0825.com PORT=3002 \
#     sudo -E bash deploy/install-site.sh

set -euo pipefail

SITE_ID="${SITE_ID:-}"
DOMAIN="${DOMAIN:-}"
PORT="${PORT:-}"
REPO="${REPO:-https://github.com/yydsxwh/personalwebsite.git}"
BRANCH="${DEPLOY_BRANCH:-cursor/hk-dual-redeploy-de0f}"
EMAIL="${CERTBOT_EMAIL:-yydsxwh@gmail.com}"
SERVER_IP="${SERVER_IP:-47.242.157.181}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "请用 root 运行：sudo -E bash $0"
  exit 1
fi

if [[ -z "$SITE_ID" || -z "$DOMAIN" || -z "$PORT" ]]; then
  echo "用法：SITE_ID=客户目录名 DOMAIN=客户域名 PORT=本机端口 sudo -E bash $0"
  echo "例：  SITE_ID=zhouyuding0825 DOMAIN=zhouyuding0825.com PORT=3002 sudo -E bash $0"
  exit 1
fi

if [[ ! "$SITE_ID" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "SITE_ID 只能用小写字母、数字和连字符，例如 zhouyuding0825"
  exit 1
fi

if [[ "$SITE_ID" == "xiaowenhua" || "$DOMAIN" == "xiaowenhua.net" || "$DOMAIN" == "www.xiaowenhua.net" ]]; then
  echo "拒绝：这是客户站安装脚本，不能拿来改你自己的 xiaowenhua.net。"
  echo "自己的站继续用 deploy/setup-on-server.sh。"
  exit 1
fi

if [[ "$PORT" == "3000" || "$PORT" == "3001" ]]; then
  echo "拒绝：端口 $PORT 已留给旧站 / xiaowenhua，客户站请用 3002 起。"
  exit 1
fi

ROOT_DIR="/var/www/${SITE_ID}"
APP_DIR="${ROOT_DIR}/app"
DATA_DIR="${ROOT_DIR}/data"
SERVICE_NAME="${SITE_ID}"
NGINX_SITE="${DOMAIN}"

if [[ "$ROOT_DIR" == /var/www/xiaowenhua || "$ROOT_DIR" == /var/www/yyds-course-platform ]]; then
  echo "拒绝：不能装进已有站点目录 $ROOT_DIR"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_NGINX="${SCRIPT_DIR}/templates/nginx-site.conf"
TEMPLATE_SERVICE="${SCRIPT_DIR}/templates/site.service"
if [[ ! -f "$TEMPLATE_NGINX" || ! -f "$TEMPLATE_SERVICE" ]]; then
  echo "找不到模板，请在仓库的 deploy 目录下运行。"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git curl ca-certificates nginx python3-certbot-nginx

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -qE '^v(2[0-9]|[3-9])'; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

mkdir -p "$ROOT_DIR" "$DATA_DIR"
if [[ -d "$APP_DIR/.git" ]]; then
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
else
  if [[ -e "$APP_DIR" ]]; then
    if [[ -n "$(ls -A "$APP_DIR" 2>/dev/null)" ]]; then
      echo "拒绝：${APP_DIR} 已有文件且不是本仓库，避免覆盖客户数据。"
      exit 1
    fi
    rmdir "$APP_DIR"
  fi
  git clone --branch "$BRANCH" "$REPO" "$APP_DIR"
fi
mkdir -p "${APP_DIR}/public/uploads"

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
  echo "已为 ${DOMAIN} 生成独立 .env（新密钥、新数据库）。"
else
  echo "沿用已有 ${APP_DIR}/.env，不覆盖，以免串数据。"
fi

if grep -q '/var/www/xiaowenhua/' .env; then
  echo "拒绝：.env 指向了 xiaowenhua 的数据库，已停止，避免两家数据混用。"
  exit 1
fi

npm install
npx prisma db push
USER_COUNT="$(npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.user.count().then((n) => { console.log(n); return p.\$disconnect(); })")"
if [[ "${USER_COUNT}" == "0" ]]; then
  npx tsx prisma/seed.ts
fi

npm run build

TMP_NGINX="$(mktemp)"
TMP_SERVICE="$(mktemp)"
sed -e "s|__DOMAIN__|${DOMAIN}|g" -e "s|__PORT__|${PORT}|g" "$TEMPLATE_NGINX" > "$TMP_NGINX"
sed -e "s|__DOMAIN__|${DOMAIN}|g" \
    -e "s|__PORT__|${PORT}|g" \
    -e "s|__APP_DIR__|${APP_DIR}|g" \
    "$TEMPLATE_SERVICE" > "$TMP_SERVICE"

install -m 644 "$TMP_SERVICE" "/etc/systemd/system/${SERVICE_NAME}.service"
install -m 644 "$TMP_NGINX" "/etc/nginx/sites-available/${NGINX_SITE}"
rm -f "$TMP_NGINX" "$TMP_SERVICE"
ln -sfn "/etc/nginx/sites-available/${NGINX_SITE}" "/etc/nginx/sites-enabled/${NGINX_SITE}"

nginx -t
systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
systemctl reload nginx

if curl -fsS --max-time 8 "http://127.0.0.1:${PORT}/about/person" >/dev/null; then
  echo "本机 ${PORT} 端口已通（${DOMAIN}）。"
else
  echo "警告：本机 ${PORT} 尚未响应，用 journalctl -u ${SERVICE_NAME} -n 50 查看日志。"
fi

DNS_OK=0
if host "$DOMAIN" 2>/dev/null | grep -q "$SERVER_IP"; then
  DNS_OK=1
fi

if [[ "$DNS_OK" -eq 1 ]]; then
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || \
    echo "证书申请失败：确认 DNS 已指向 ${SERVER_IP} 后再运行 certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
else
  echo "DNS 还没指到 ${SERVER_IP}，先跳过 HTTPS。在域名控制台加："
  echo "  主机记录 @    类型 A    记录值 ${SERVER_IP}"
  echo "  主机记录 www  类型 A    记录值 ${SERVER_IP}"
  echo "解析生效后执行："
  echo "  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m ${EMAIL} --redirect"
fi

echo
echo "完成。客户站与 xiaowenhua 已隔离："
echo "  代码     ${APP_DIR}"
echo "  数据库   ${DATA_DIR}/prod.db"
echo "  上传     ${APP_DIR}/public/uploads"
echo "  进程     systemctl status ${SERVICE_NAME}"
echo "  后台     /login   默认 admin@yyds.local / 123456 （交给客户后立刻改）"
echo "不要把 ${DATA_DIR} 或 uploads 拷到其他客户目录。"
