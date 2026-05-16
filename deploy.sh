#!/bin/bash
set -euo pipefail

# ── Colors ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Valid service names ──────────────────────────────────
SERVICES=("FrontendService" "ApiService" "AuthService")

# ── Helpers ──────────────────────────────────────────────
containsElement () {
  local e match="$1"
  shift
  for e; do [[ "$e" == "$match" ]] && return 0; done
  return 1
}

show_help () {
  echo -e "${BOLD}Usage:${NC} ./deploy.sh [SERVICE...] [-- <cdk-args>]"
  echo
  echo -e "Deploy Wun2Free Entertainment HR system services to AWS."
  echo
  echo -e "${BOLD}Services:${NC}"
  echo -e "  FrontendService    Build & deploy React frontend        (S3 + CloudFront)"
  echo -e "  ApiService         Test & deploy Go backend API         (Lambda + API Gateway)"
  echo -e "  AuthService        Deploy Cognito authentication stack"
  echo -e "  --all              Deploy all services"
  echo
  echo -e "${BOLD}Options:${NC}"
  echo -e "  -h, --help         Show this help message"
  echo -e "  --                 Pass remaining arguments to cdk deploy"
  echo -e "                     (e.g. ./deploy.sh --all -- --profile prod)"
  echo
  echo -e "${BOLD}Examples:${NC}"
  echo -e "  ./deploy.sh FrontendService                         Deploy frontend only"
  echo -e "  ./deploy.sh ApiService AuthService                  Deploy API + Auth"
  echo -e "  ./deploy.sh --all                                   Deploy everything"
  echo -e "  ./deploy.sh FrontendService -- --profile prod        CDK with profile"
  echo
  echo -e "${BOLD}Note:${NC} AuthService must be deployed before ApiService."
}

# ── Parse arguments ──────────────────────────────────────
# Split at -- to separate service names from CDK arguments
ARGS=()
CDK_ARGS=()
FOUND_DASH=false
for arg in "$@"; do
  if [ "$arg" = "--" ]; then
    FOUND_DASH=true
  elif $FOUND_DASH; then
    CDK_ARGS+=("$arg")
  else
    ARGS+=("$arg")
  fi
done

# ── Help / no args ───────────────────────────────────────
if [ ${#ARGS[@]} -eq 0 ] || containsElement "-h" "${ARGS[@]}" || containsElement "--help" "${ARGS[@]}"; then
  show_help
  exit 0
fi

# ── Expand --all ─────────────────────────────────────────
DEPLOY_ALL=false
if containsElement "--all" "${ARGS[@]}"; then
  echo -e "${GREEN}→ Deploying all services${NC}"
  DEPLOY_ALL=true
  CDK_ARGS+=("--all")
  # Keep ARGS expanded for build/test checks below
  ARGS=("${SERVICES[@]}")
fi

# ── Validate service names ───────────────────────────────
for svc in "${ARGS[@]}"; do
  if ! containsElement "$svc" "${SERVICES[@]}"; then
    echo -e "${RED}Error:${NC} Unknown service '$svc'"
    echo "Valid services: ${SERVICES[*]}, --all"
    exit 1
  fi
done

echo -e "${CYAN}Services to deploy:${NC} ${ARGS[*]}"
[ ${#CDK_ARGS[@]} -gt 0 ] && echo -e "${CYAN}CDK args:${NC} ${CDK_ARGS[*]}"
echo ""

# ── Frontend build (if needed) ───────────────────────────
if containsElement "FrontendService" "${ARGS[@]}"; then
  echo -e "${YELLOW}━━━ Building Frontend ━━━${NC}"
  (cd src/frontend && pnpm run build)
  echo -e "${GREEN}✓ Frontend build complete${NC}"
  echo ""
fi

# ── Backend tests (if needed) ────────────────────────────
if containsElement "ApiService" "${ARGS[@]}"; then
  echo -e "${YELLOW}━━━ Testing ApiService ━━━${NC}"
  pnpm run test:Googlesheets
  echo -e "${GREEN}✓ ApiService tests passed${NC}"
  echo ""
fi

# ── CDK synth warning for TypeScript config changes ──────
echo -e "${YELLOW}━━━ Synthesizing & deploying CDK stacks ━━━${NC}"
tsc

# ── CDK deploy ───────────────────────────────────────────
if $DEPLOY_ALL; then
  cdk deploy "${CDK_ARGS[@]}"
else
  cdk deploy "${ARGS[@]}" "${CDK_ARGS[@]}"
fi

echo -e "${GREEN}✓ Deployment complete${NC}"
