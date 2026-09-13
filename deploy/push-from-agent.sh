#!/usr/bin/env bash
# 从 Cloud Agent / 本机用 DEPLOY_SSH_KEY 登录香港机，执行双站部署。
# 需要环境变量：DEPLOY_HOST（默认 47.242.157.181）、DEPLOY_USER（默认 root）、DEPLOY_SSH_KEY

set -euo pipefail

HOST="${DEPLOY_HOST:-47.242.157.181}"
USER="${DEPLOY_USER:-root}"
BRANCH="${DEPLOY_BRANCH:-cursor/hk-dual-redeploy-de0f}"
KEYFILE="${DEPLOY_KEY_FILE:-$HOME/.ssh/hk-dual-site}"
REMOTE_URL="https://raw.githubusercontent.com/yydsxwh/personalwebsite/${BRANCH}/deploy/setup-both-sites.sh"

write_key() {
  python3 - "$KEYFILE" <<'PY'
import os, re, sys
from pathlib import Path
raw = os.environ.get("DEPLOY_SSH_KEY", "")
if not raw.strip():
    sys.exit("缺少 DEPLOY_SSH_KEY")
text = raw.replace("\r\n", "\n").replace("\r", "\n").replace("\\n", "\n")
if "\n" not in text and "BEGIN" in text:
    for header in (
        "-----BEGIN OPENSSH PRIVATE KEY-----",
        "-----BEGIN RSA PRIVATE KEY-----",
        "-----BEGIN PRIVATE KEY-----",
        "-----BEGIN EC PRIVATE KEY-----",
    ):
        if text.startswith(header):
            footer = header.replace("BEGIN", "END")
            body = text[len(header):]
            if body.endswith(footer):
                body = body[: -len(footer)]
            if header == "-----BEGIN OPENSSH PRIVATE KEY-----":
                body = "".join(body.split())
                wrapped = "\n".join(body[i:i + 70] for i in range(0, len(body), 70))
                text = header + "\n" + wrapped + "\n" + footer + "\n"
            else:
                b64 = re.sub(r"[^A-Za-z0-9+/=]", "", body)
                lines = [b64[i:i + 64] for i in range(0, len(b64), 64)]
                text = header + "\n" + "\n".join(lines) + "\n" + footer + "\n"
            break
path = Path(sys.argv[1])
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(text if text.endswith("\n") else text + "\n")
path.chmod(0o600)
print(f"wrote {path} ({len(path.read_text().splitlines())} lines)")
PY
}

write_key

# PKCS#1 / one-line PEM secrets are valid to ssh-keygen but some ssh
# clients stall or skip them (identity type -1). Convert in place.
if ! ssh-keygen -y -f "$KEYFILE" >/dev/null 2>&1; then
  echo "DEPLOY_SSH_KEY 无法解析成私钥"
  exit 1
fi
if head -n1 "$KEYFILE" | grep -qE 'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY'; then
  ssh-keygen -p -N "" -f "$KEYFILE" >/dev/null
fi

ssh_opts=(
  -i "$KEYFILE"
  -o BatchMode=yes
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=accept-new
  -o ConnectTimeout=15
  -o IPQoS=none
)

ssh_try() {
  local user="$1"
  ssh "${ssh_opts[@]}" "${user}@${HOST}" "echo SSH_OK"
}

CONNECTED_USER=""
for try_user in "$USER" root admin ubuntu; do
  echo "尝试 ${try_user}@${HOST} ..."
  if ssh_try "$try_user"; then
    CONNECTED_USER="$try_user"
    break
  fi
done

if [[ -z "$CONNECTED_USER" ]]; then
  echo
  echo "SSH 失败：当前 DEPLOY_SSH_KEY 还没写进服务器 authorized_keys。"
  echo "请用阿里云控制台「远程连接」以 root 执行："
  echo "  curl -fsSL ${REMOTE_URL} | sudo bash"
  echo "脚本会写入本钥匙的公钥，之后再跑本文件即可。"
  exit 1
fi

echo "用 ${CONNECTED_USER}@${HOST} 执行双站部署..."
ssh "${ssh_opts[@]}" \
  "${CONNECTED_USER}@${HOST}" \
  "DEPLOY_BRANCH='${BRANCH}' curl -fsSL '${REMOTE_URL}' | sudo -E bash"
