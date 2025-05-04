#!/bin/bash

# Check for environment file
echo "Checking for environment file (.env)..."
if [ ! -f ".env" ]; then
  echo "Error: .env file not found!"
  echo "This file is required for environment configuration."
  echo "Please create the .env file with the required environment variables."
  exit 1
fi
echo "Found .env file with environment variables"

# Run all tests
echo "Running tests..."
go test -v ./...
if [ $? -ne 0 ]; then
  echo "Tests failed. Please fix the failing tests before running the server."
  exit 1
fi
echo "All tests passed successfully"

# Build the server
echo "Building server..."
local_server_path="./build/local_server"
go build -o $local_server_path server.go
if [ $? -ne 0 ]; then
  echo "Build failed. Please check the error messages above."
  exit 1
fi

# Set default port if not provided
PORT=${PORT:-8080}

echo "Starting local development server on port $PORT..."
echo "Available endpoints:"
echo "  /availability"
echo "  /auth"
echo "  /timesheet"
echo "  /scheduling"
echo
echo "Press Ctrl+C to stop the server"
echo

# Run the server
eval $local_server_path
