#!/usr/bin/env bash
# 把 Cloud Agent 部署公钥写进香港机 authorized_keys。
# 只改 SSH 登录，不部署、不重启网站。
#
# 用法（阿里云「远程连接」root）：
#   curl -fsSL https://raw.githubusercontent.com/yydsxwh/personalwebsite/cursor/hk-dual-site-deploy-b133/deploy/add-agent-key.sh | sudo bash
#
# 若你自己另造了一把钥匙，把 .pub 整行赋给 AGENT_PUBKEY 再跑。

set -euo pipefail

AGENT_PUBKEY="${AGENT_PUBKEY:-ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOnoSIzmgruj6YEcUuhotrh0mfQ5v79r7dJb13iEK2kp cursor-hk-deploy}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "请用 root 运行：sudo bash $0"
  exit 1
fi

if [[ ! "$AGENT_PUBKEY" =~ ^ssh-(ed25519|rsa|dss) ]]; then
  echo "AGENT_PUBKEY 必须是一行 ssh-ed25519 / ssh-rsa 公钥，不要贴私钥。"
  exit 1
fi

comment="$(awk '{print $3}' <<<"$AGENT_PUBKEY")"
homes=("/root")
[[ -d /home/ubuntu ]] && homes+=("/home/ubuntu")
[[ -d /home/admin ]] && homes+=("/home/admin")

for home in "${homes[@]}"; do
  user="$(stat -c '%U' "$home" 2>/dev/null || echo root)"
  mkdir -p "$home/.ssh"
  chmod 700 "$home/.ssh"
  touch "$home/.ssh/authorized_keys"
  chmod 600 "$home/.ssh/authorized_keys"
  if grep -qF "$AGENT_PUBKEY" "$home/.ssh/authorized_keys"; then
    echo "已存在：$home/.ssh/authorized_keys"
    continue
  fi
  if [[ -n "$comment" ]] && grep -qF "$comment" "$home/.ssh/authorized_keys"; then
    echo "更新旧的 $comment 公钥：$home/.ssh/authorized_keys"
    grep -vF "$comment" "$home/.ssh/authorized_keys" > "$home/.ssh/authorized_keys.tmp"
    mv "$home/.ssh/authorized_keys.tmp" "$home/.ssh/authorized_keys"
    chmod 600 "$home/.ssh/authorized_keys"
  fi
  echo "$AGENT_PUBKEY" >> "$home/.ssh/authorized_keys"
  chown -R "$user:$user" "$home/.ssh" 2>/dev/null || true
  echo "已写入：$home/.ssh/authorized_keys"
done

echo
echo "完成。Cursor My Secrets 里用同一把私钥（DEPLOY_SSH_KEY），"
echo "每个仓库的 Cloud Agent 环境都加上 DEPLOY_HOST / DEPLOY_USER / DEPLOY_SSH_KEY 后，"
echo "新开一个 Agent 就能 SSH 到这台香港机，按各自目录部署独立站点。"
