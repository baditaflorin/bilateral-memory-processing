#!/usr/bin/env bash
set -euo pipefail

npm run build

rm -rf tmp/pages-preview
mkdir -p tmp/pages-preview/bilateral-memory-processing
cp -R docs/. tmp/pages-preview/bilateral-memory-processing/

python3 -m http.server 4173 --directory tmp/pages-preview >/tmp/bilateral-memory-processing-smoke.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" >/dev/null 2>&1 || true' EXIT

for _ in {1..40}; do
  if curl -fsS "http://127.0.0.1:4173/bilateral-memory-processing/" >/dev/null; then
    break
  fi
  sleep 0.25
done

PLAYWRIGHT_BASE_URL="http://127.0.0.1:4173/bilateral-memory-processing/" npx playwright test
