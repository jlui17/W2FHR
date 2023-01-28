#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { ApiService } from "../lib/services/ApiService";
import { AuthService } from "../lib/services/AuthService";
import { GoogleSheetsService } from "../lib/services/GoogleSheetsService";

const app = new cdk.App();
const googleSheetsService = new GoogleSheetsService(app, "GoogleSheetsService");
const authService = new AuthService(app, "AuthService");
const apiServiceDependencies = [googleSheetsService, authService];

const apiService = new ApiService(app, "ApiService", {
  GoogleSheets: {
    availabilityHandler: googleSheetsService.availabilityHandler,
    timesheetHandler: googleSheetsService.timesheetHandler,
    authHandler: googleSheetsService.authHandler,
  },
  AuthService: {
    userPool: authService.userPool,
  },
});
apiService.addDependencies(apiServiceDependencies);

app.synth();
