#!/usr/bin/env bash
# 把 Cloud Agent 部署公钥写进香港机 authorized_keys。
# 只改 SSH 登录，不部署、不重启网站。
#
# 用法（阿里云「远程连接」root）：
#   curl -fsSL https://raw.githubusercontent.com/yydsxwh/personalwebsite/cursor/hk-dual-redeploy-de0f/deploy/add-agent-key.sh | sudo bash
#
# 若你自己另造了一把钥匙，把 .pub 整行赋给 AGENT_PUBKEY 再跑。

set -euo pipefail

# My Secrets 里当前 DEPLOY_SSH_KEY 对应的 RSA 公钥，以及文档里那把 ed25519。
# 两把都写上，避免 Agent 换钥匙后登不进去。
DEFAULT_PUBKEYS=(
  "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC+gqe3sgSPPJQ4Jmz9lNz3jLxFRhNAOd+F9YG2pIIjoP8pqMg9DWBHoSaNv9WNYOXSScNkIs718hlMqNEtdoDCG84w06Mgs5kcZA0SzgyfcwTCtFRNUBUl7GVTf2JNgdLk6faJBzls5vvjPgAUaY6Tnm2J3loA9TtT2I72fSyOrRsaynswOpFWQpQNNEsXWNjz/THKegpq3DEZRlUdYV/0513vWB6i+rW/LEzMD2Ky1CrAMGtc4aTHAqBBUtNQT3LITsRyjXRRAPIFtzk65+cPxUKe4fDDEU//DqmKIMHA3bW0t+rwH2bgkfrAHF7HRRXp+hf4xEoneW1uR+fKku4/ cursor-hk-dual-site"
  "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOnoSIzmgruj6YEcUuhotrh0mfQ5v79r7dJb13iEK2kp cursor-hk-deploy"
)

if [[ "$(id -u)" -ne 0 ]]; then
  echo "请用 root 运行：sudo bash $0"
  exit 1
fi

install_one() {
  local key="$1"
  if [[ ! "$key" =~ ^ssh-(ed25519|rsa|dss) ]]; then
    echo "跳过非法公钥：$key"
    return 1
  fi
  local comment
  comment="$(awk '{print $3}' <<<"$key")"
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
      echo "已存在：$home/.ssh/authorized_keys （$comment）"
      continue
    fi
    if [[ -n "$comment" ]] && grep -qF "$comment" "$home/.ssh/authorized_keys"; then
      echo "更新旧的 $comment 公钥：$home/.ssh/authorized_keys"
      grep -vF "$comment" "$home/.ssh/authorized_keys" > "$home/.ssh/authorized_keys.tmp"
      mv "$home/.ssh/authorized_keys.tmp" "$home/.ssh/authorized_keys"
      chmod 600 "$home/.ssh/authorized_keys"
    fi
    echo "$key" >> "$home/.ssh/authorized_keys"
    chown -R "$user:$user" "$home/.ssh" 2>/dev/null || true
    echo "已写入：$home/.ssh/authorized_keys （$comment）"
  done
}

if [[ -n "${AGENT_PUBKEY:-}" ]]; then
  install_one "$AGENT_PUBKEY"
else
  for key in "${DEFAULT_PUBKEYS[@]}"; do
    install_one "$key"
  done
fi

echo
echo "完成。Cursor My Secrets 里用同一把私钥（DEPLOY_SSH_KEY），"
echo "每个仓库的 Cloud Agent 环境都加上 DEPLOY_HOST / DEPLOY_USER / DEPLOY_SSH_KEY 后，"
echo "新开一个 Agent 就能 SSH 到这台香港机，按各自目录部署独立站点。"
