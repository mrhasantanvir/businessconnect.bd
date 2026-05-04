#!/bin/bash

set -euo pipefail

PROJECT_PATH="${PROJECT_PATH:-/www/wwwroot/businessconnect.bd}"
RUNTIME_FILE="$PROJECT_PATH/config/db-cluster.runtime.json"
LOG_FILE="$PROJECT_PATH/deployment.log"

if [ ! -f "$RUNTIME_FILE" ]; then
  echo "[self-hosted-vm] Runtime config not found: $RUNTIME_FILE" | tee -a "$LOG_FILE"
  exit 1
fi

PROVIDER=$(node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write((p.provider||'').toUpperCase());" "$RUNTIME_FILE")
if [ "$PROVIDER" != "SELF_HOSTED_VM" ]; then
  echo "[self-hosted-vm] Provider is $PROVIDER, skipping VM provisioning." | tee -a "$LOG_FILE"
  exit 0
fi

SSH_USER=$(node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write((p.vm?.sshUser||'').trim());" "$RUNTIME_FILE")
SSH_PORT=$(node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(String(p.vm?.sshPort||22));" "$RUNTIME_FILE")
SSH_KEY=$(node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(p.vm?.sshPrivateKey||'');" "$RUNTIME_FILE")
HOSTS=$(node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const all=[...(p.vm?.writeHosts||[]),...(p.vm?.readHosts||[])].filter(Boolean);process.stdout.write([...new Set(all)].join('\n'));" "$RUNTIME_FILE")

if [ -z "$SSH_USER" ] || [ -z "$SSH_KEY" ] || [ -z "$HOSTS" ]; then
  echo "[self-hosted-vm] Missing SSH user/key/hosts in DB cluster settings." | tee -a "$LOG_FILE"
  exit 1
fi

TMP_KEY=$(mktemp)
chmod 600 "$TMP_KEY"
printf "%s" "$SSH_KEY" > "$TMP_KEY"

SSH_BASE_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p $SSH_PORT -i $TMP_KEY"

while IFS= read -r HOST; do
  [ -z "$HOST" ] && continue
  echo "[self-hosted-vm] Provisioning MySQL on $HOST ..." | tee -a "$LOG_FILE"

  ssh $SSH_BASE_OPTS "$SSH_USER@$HOST" "sudo bash -lc '
    set -e
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y mysql-server
    CONF=/etc/mysql/mysql.conf.d/mysqld.cnf
    if grep -q \"^bind-address\" \"$CONF\"; then
      sed -i \"s/^bind-address.*/bind-address = 0.0.0.0/\" \"$CONF\"
    else
      echo \"bind-address = 0.0.0.0\" >> \"$CONF\"
    fi
    grep -q \"^server-id\" \"$CONF\" || cat >> \"$CONF\" <<EOF
server-id = 1
log_bin = mysql-bin
binlog_format = ROW
EOF
    systemctl enable mysql
    systemctl restart mysql
    mkdir -p /etc/businessconnect
  '"

  scp $SSH_BASE_OPTS "$RUNTIME_FILE" "$SSH_USER@$HOST:/tmp/db-cluster.runtime.json" >/dev/null
  ssh $SSH_BASE_OPTS "$SSH_USER@$HOST" "sudo mv /tmp/db-cluster.runtime.json /etc/businessconnect/db-cluster.runtime.json"

  echo "[self-hosted-vm] $HOST provisioned." | tee -a "$LOG_FILE"
done <<< "$HOSTS"

rm -f "$TMP_KEY"

echo "[self-hosted-vm] VM MySQL cluster provisioning completed." | tee -a "$LOG_FILE"
