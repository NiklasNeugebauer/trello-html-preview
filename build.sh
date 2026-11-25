#!/usr/bin/env bash
# Assembles dist/<browser>/ from the shared sources plus that browser's own files.
# VERSION=1.2.3 ./build.sh writes that version into both manifests (CI takes it from the tag).
set -euo pipefail
cd "$(dirname "$0")"

for browser in firefox chrome; do
  rm -rf "dist/$browser"
  mkdir -p "dist/$browser"
  cp src/common/* "src/$browser"/* "dist/$browser/"
  if [[ -n "${VERSION:-}" ]]; then
    jq --arg v "$VERSION" '.version = $v' "src/$browser/manifest.json" > "dist/$browser/manifest.json"
  fi
done
echo "built dist/firefox dist/chrome"
