#!/bin/bash

set -euo pipefail

PROJECT_PATH="${PROJECT_PATH:-/www/wwwroot/businessconnect.bd}"
APP_NAME="${APP_NAME:-businessconnect-prod}"
RUNTIME_FILE="$PROJECT_PATH/config/db-cluster.runtime.json"
LOG_FILE="$PROJECT_PATH/deployment.log"

if [ ! -f "$RUNTIME_FILE" ]; then
  echo "[db-cluster] Runtime config not found at $RUNTIME_FILE"
  exit 1
fi

echo "[db-cluster] Applying runtime DB cluster config at $(date)" | tee -a "$LOG_FILE"

cd "$PROJECT_PATH"

if [ -f ".env.production" ]; then
  if grep -q '^DB_CLUSTER_RUNTIME_FILE=' .env.production; then
    sed -i "s|^DB_CLUSTER_RUNTIME_FILE=.*|DB_CLUSTER_RUNTIME_FILE=$RUNTIME_FILE|" .env.production
  else
    echo "DB_CLUSTER_RUNTIME_FILE=$RUNTIME_FILE" >> .env.production
  fi
fi

pm2 reload "$APP_NAME" --update-env >/dev/null 2>&1 || true

echo "[db-cluster] Config applied and PM2 reloaded" | tee -a "$LOG_FILE"
