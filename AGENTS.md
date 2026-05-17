# Wun2Free Entertainment HR System

## Project Overview

This project is a full-stack application for Wun2Free Entertainment's HR system. It allows employees to view their schedules, set their availability, and see their shift history.

The project is built using the following technologies:

*   **Frontend:**
    *   TypeScript
    *   React
    *   Vite
    *   TailwindCSS
    *   React Router
    *   AWS Cognito SDK
*   **Backend:**
    *   Go
    *   Google Sheets SDK
    *   AWS Lambda
    *   AWS API Gateway
*   **Infrastructure:**
    *   AWS CDK

The project is divided into three main services:

*   **AuthService:** Handles user authentication and authorization using Amazon Cognito.
*   **ApiService:** Provides the backend API for the frontend to interact with the Google Sheets database.
*   **FrontendService:** Serves the frontend application using Amazon S3 and CloudFront.

## Building and Running

### Frontend

To run the frontend locally for development, use the following command:

```bash
cd src/frontend
pnpm dev
```

To build the frontend for production, use the following command:

```bash
cd src/frontend
pnpm build
```

### Backend

To run the backend tests, use the following command:

```bash
pnpm test
```

## Deployment

To deploy the application, use the following script:

```bash
./deploy.sh [service]
```

Where `[service]` is one of the following:

*   `FrontendService`: Deploys the frontend service.
*   `ApiService`: Deploys the backend API service.
*   `--all`: Deploys all services.

If no service is specified, it will deploy all services.

## Development Conventions

*   The project uses `pnpm` as the package manager.
*   The frontend code is located in the `src/frontend` directory.
*   The backend code is located in the `src/GoogleSheets` directory.
*   The infrastructure code is located in the `lib` directory.
*   The project uses the AWS CDK for infrastructure as code.
*   The project uses Jest for testing the backend.
