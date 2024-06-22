#!/bin/bash

# Function to check if an array contains a value
containsElement () {
  local e match="$1"
  shift
  for e; do [[ "$e" == "$match" ]] && return 0; done
  return 1
}

# Convert script arguments into an array
args=("$@")

# Check if "FrontendService" is in the arguments
if containsElement "FrontendService" "${args[@]}" || containsElement "--all" "${args[@]}"; then
  echo "Deploying FrontendService..."
  # If FrontendService is a part of the deployment, build it
  cd src/frontend && yarn build && cd ../..
fi

# Proceed with TypeScript compilation and CDK deploy
# Note: Adjust the cdk deploy command as needed to include all services or based on passed arguments
tsc
cdk deploy "$@"
