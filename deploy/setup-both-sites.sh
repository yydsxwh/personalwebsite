#!/usr/bin/env bash
# 在香港 Ubuntu 上一键安装/更新两个互不串数据的个人站：
#   1) xiaowenhua.net     → /var/www/xiaowenhua      端口 3001
#   2) zhouyuding0825.com → /var/www/zhouyuding0825  端口 3002
#
# 不会改 Andyyyds 主站 /var/www/yyds-course-platform（端口 3000）。
#
# 用法（root，阿里云「远程连接」或 SSH）：
#   curl -fsSL https://raw.githubusercontent.com/yydsxwh/personalwebsite/cursor/hk-dual-site-deploy-b133/deploy/setup-both-sites.sh | sudo bash

set -euo pipefail

REPO="${REPO:-https://github.com/yydsxwh/personalwebsite.git}"
BRANCH="${DEPLOY_BRANCH:-cursor/hk-dual-site-deploy-b133}"
EMAIL="${CERTBOT_EMAIL:-yydsxwh@gmail.com}"
SERVER_IP="${SERVER_IP:-47.242.157.181}"
WORKDIR="${WORKDIR:-/tmp/personalwebsite-dual-deploy}"
CLIENT_SITE_ID="${CLIENT_SITE_ID:-zhouyuding0825}"
CLIENT_DOMAIN="${CLIENT_DOMAIN:-zhouyuding0825.com}"
CLIENT_PORT="${CLIENT_PORT:-3002}"

# 与 Cursor My Secrets 里 DEPLOY_SSH_KEY 配对的公钥（见 deploy/README.md）。
AGENT_PUBKEY="${AGENT_PUBKEY:-ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOnoSIzmgruj6YEcUuhotrh0mfQ5v79r7dJb13iEK2kp cursor-hk-deploy}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "请用 root 运行：sudo bash $0"
  exit 1
fi

install_agent_pubkey() {
  local key="$AGENT_PUBKEY"
  [[ -z "$key" ]] && return 0
  local homes=("/root")
  [[ -d /home/ubuntu ]] && homes+=("/home/ubuntu")
  [[ -d /home/admin ]] && homes+=("/home/admin")
  local home
  for home in "${homes[@]}"; do
    local user
    user="$(stat -c '%U' "$home" 2>/dev/null || echo root)"
    mkdir -p "$home/.ssh"
    chmod 700 "$home/.ssh"
    touch "$home/.ssh/authorized_keys"
    chmod 600 "$home/.ssh/authorized_keys"
    if grep -qF "$key" "$home/.ssh/authorized_keys"; then
      echo "已存在：$home/.ssh/authorized_keys"
    else
      echo "$key" >> "$home/.ssh/authorized_keys"
      echo "已写入部署公钥：$home/.ssh/authorized_keys"
    fi
    chown -R "$user:$user" "$home/.ssh" 2>/dev/null || true
  done
}

echo "==> 写入 Cloud Agent 部署公钥（不影响现有网站）"
if [[ -f deploy/add-agent-key.sh ]]; then
  AGENT_PUBKEY="$AGENT_PUBKEY" bash deploy/add-agent-key.sh
else
  install_agent_pubkey
fi

echo "==> 拉取部署脚本 ${BRANCH}"
rm -rf "$WORKDIR"
git clone --depth 1 --branch "$BRANCH" "$REPO" "$WORKDIR"
cd "$WORKDIR"
chmod +x deploy/setup-on-server.sh deploy/install-site.sh

echo
echo "==> [1/2] 更新自己的站 xiaowenhua.net（不重置数据库、不改主站）"
DEPLOY_BRANCH="$BRANCH" bash deploy/setup-on-server.sh

echo
echo "==> [2/2] 安装/更新客户站 ${CLIENT_DOMAIN}（独立目录/数据库/上传）"
if [[ -d /var/www/yyds-course-platform ]]; then
  echo "检测到 Andyyyds 主站 /var/www/yyds-course-platform，保持不动。"
fi
SITE_ID="$CLIENT_SITE_ID" DOMAIN="$CLIENT_DOMAIN" PORT="$CLIENT_PORT" \
  DEPLOY_BRANCH="$BRANCH" CERTBOT_EMAIL="$EMAIL" SERVER_IP="$SERVER_IP" \
  bash deploy/install-site.sh

echo
echo "==> 健康检查"
systemctl is-active xiaowenhua >/dev/null && echo "xiaowenhua: active" || echo "xiaowenhua: 未运行"
systemctl is-active "$CLIENT_SITE_ID" >/dev/null && echo "${CLIENT_SITE_ID}: active" || echo "${CLIENT_SITE_ID}: 未运行"
systemctl is-active nginx >/dev/null && echo "nginx: active" || echo "nginx: 未运行"

curl -fsS --max-time 8 -o /dev/null -w "xiaowenhua 本机3001: %{http_code}\n" "http://127.0.0.1:3001/about/person" || echo "xiaowenhua 本机3001: 无响应"
curl -fsS --max-time 8 -o /dev/null -w "客户站本机${CLIENT_PORT}: %{http_code}\n" "http://127.0.0.1:${CLIENT_PORT}/about/person" || echo "客户站本机${CLIENT_PORT}: 无响应"
curl -fsS --max-time 8 -o /dev/null -H "Host: xiaowenhua.net" -w "nginx Host xiaowenhua.net: %{http_code}\n" "http://127.0.0.1/about/person" || true
curl -fsS --max-time 8 -o /dev/null -H "Host: ${CLIENT_DOMAIN}" -w "nginx Host ${CLIENT_DOMAIN}: %{http_code}\n" "http://127.0.0.1/about/person" || true

echo
echo "两个个人站已按隔离方式部署："
echo "  https://xiaowenhua.net          数据 /var/www/xiaowenhua"
echo "  http://${CLIENT_DOMAIN}         数据 /var/www/${CLIENT_SITE_ID} （需 A 记录指向 ${SERVER_IP} 才能对外 HTTPS）"
echo "Andyyyds 主站 https://www.yydsxwh.com 未改动。"
echo "不要拷贝任何一家的 prod.db / uploads / .env 到另一家。"
