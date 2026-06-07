#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

case "${1:-}" in
  AuthService)
    pnpm build:cdk
    ;;
  ApiService)
    pnpm build:backend
    pnpm build:cdk
    ;;
  FrontendService)
    pnpm build:frontend
    pnpm build:cdk
    ;;
  "")
    pnpm build
    set -- --all
    ;;
  *)
    pnpm build
    ;;
esac

if [[ -f "$ROOT_DIR/.op/plugins/cdk.json" ]]; then
  op plugin run -- cdk deploy "$@"
else
  pnpm cdk deploy "$@"
fi
