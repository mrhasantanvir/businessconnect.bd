#!/bin/bash

# --- BusinessConnect.bd Zero-Downtime Deployment Script ---
APP_NAME="business-connect-prod"
BRANCH="main"
LOG_FILE="./deployment.log"

echo "----------------------------------------------------" >> $LOG_FILE
echo "🚀 Deployment started at $(date)" | tee -a $LOG_FILE

# 1. Fetch latest code
echo "📥 Syncing with $BRANCH branch..." | tee -a $LOG_FILE
git fetch origin $BRANCH
git reset --hard origin/$BRANCH

# 2. Install dependencies
echo "📦 Installing production dependencies..." | tee -a $LOG_FILE
npm ci --production=false # We need devDeps for build

# 3. Build the project
echo "🏗️ Building the Next.js application..." | tee -a $LOG_FILE
npm run build || { echo "❌ Build failed! Aborting deployment." | tee -a $LOG_FILE; exit 1; }

# 4. Finalize database & environment
echo "🗄️ Updating database schema..." | tee -a $LOG_FILE
npx prisma generate

# 5. Zero-Downtime Reload
echo "♻️ Reloading PM2 instances..." | tee -a $LOG_FILE
pm2 reload $APP_NAME --update-env || { 
    echo "⚠️ PM2 reload failed. Attempting to start new instance..." | tee -a $LOG_FILE
    pm2 start npm --name "$APP_NAME" -- start
}

echo "✅ Deployment completed successfully at $(date)" | tee -a $LOG_FILE
echo "----------------------------------------------------" >> $LOG_FILE
