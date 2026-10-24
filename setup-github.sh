#!/usr/bin/env bash
# Chay MOT LAN boi nguoi tao repo (nhom truong), trong thu muc culturetrail.
# Cach dung:  bash setup-github.sh https://github.com/<user>/<repo>.git
set -e
URL="$1"
if [ -z "$URL" ]; then echo "Thieu link repo. Vi du: bash setup-github.sh https://github.com/user/repo.git"; exit 1; fi

[ -d .git ] || git init -b main
git add .
git commit -m "chore: import initial CultureTrail project" || true
git remote add origin "$URL" 2>/dev/null || git remote set-url origin "$URL"
git push -u origin main

git checkout -b dev
git push -u origin dev
echo "Xong: da co nhanh main va dev tren GitHub."
