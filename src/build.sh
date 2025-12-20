#!/usr/bin/env sh

set -e

echo "▶ Building dagger runtime (debug)..."

npx esbuild runtime.mjs \
  --bundle \
  --format=esm \
  --platform=browser \
  --outfile=dist/dagger.runtime.debug.js \
  --sourcemap \
  --define:__DEBUG__=true \
  --minify=false \
  --tree-shaking=false

echo "✔ Debug build done"

echo "▶ Building dagger runtime (release)..."

npx esbuild runtime.mjs \
  --bundle \
  --format=esm \
  --global-name=dagger \
  --platform=browser \
  --outfile=dist/dagger.runtime.min.js \
  --define:__DEBUG__=false \
  --minify \
  --tree-shaking=true

echo "✔ Release build done"

echo "🎉 All builds finished"
