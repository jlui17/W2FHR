#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"
pnpm install

cd "$ROOT_DIR/src/frontend"
pnpm install

cd "$ROOT_DIR/src/GoogleSheets"
go mod tidy
go mod vendor
