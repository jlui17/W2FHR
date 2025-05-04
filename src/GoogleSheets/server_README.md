# Local Development HTTP Server

This server allows you to test your AWS Lambda functions locally by exposing them as HTTP endpoints.

## Available Endpoints

The server maps HTTP requests to the appropriate Lambda handler functions:

- `/auth/*` - Authentication endpoints
- `/availability/*` - Availability management
- `/timesheet/*` - Schedule retrieval
- `/scheduling/*` - Scheduling management

## How to Run

```bash
# Run with default port 8080
go run server.go

# Or specify a custom port
PORT=3000 go run server.go
```

## How It Works

This server:

1. Receives HTTP requests
2. Converts them to AWS API Gateway proxy requests
3. Routes them to the appropriate Lambda handler function
4. Converts the Lambda response back to an HTTP response

## Authentication

When testing locally, you'll need to include an `Authorization` header with a valid ID token, just as you would with the deployed API Gateway.

## Environment Configuration

This server requires a `.env` file containing environment variables in KEY=VALUE format:

```
G_SERVICE_CONFIG_JSON="{\"...\": \"...\", ...}"
COGNITO_ATTENDANTS_GROUP_NAME=...
COGNITO_SUPERVISORS_GROUP_NAME=...
COGNITO_MANAGERS_GROUP_NAME=...
```

The build and runtime process:

1. During build time:
   - Reads all variables from the `.env` file except `G_SERVICE_CONFIG_JSON`
   - Exports these variables before building the server

2. During runtime:
   - Exports the `G_SERVICE_CONFIG_JSON` variable just before running the server
   - This separates the complex JSON from the build process

This simplified approach treats all variables the same way, including the complex JSON configuration.

This approach ensures that environment variables are properly loaded before any package initialization code runs, solving timing issues with variable access.

If the `.env` file is missing or invalid, the build will not complete.

## Example Requests

### Get Availability

```
GET http://localhost:8080/availability
Authorization: <id-token>
```

### Update Availability

```
POST http://localhost:8080/availability
Authorization: <id-token>
Content-Type: application/json

{
  // availability data
}
```

### Get Schedule

```
GET http://localhost:8080/timesheet
Authorization: <id-token>
```

### Schedule by Time Range (for supervisors)

```
GET http://localhost:8080/timesheet?start=2025-01-01&end=2025-01-31
Authorization: <id-token>
