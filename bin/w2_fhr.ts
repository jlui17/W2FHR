#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { ApiService } from "../lib/services/ApiService";
import { GoogleSheetsService } from "../lib/services/GoogleSheetsService";

const app = new cdk.App();
const googleSheetsService = new GoogleSheetsService(app, "GoogleSheetsService");
const apiServiceDependencies = [googleSheetsService];

const apiService = new ApiService(app, "ApiService", {
  GoogleSheets: {
    availabilityHandler: googleSheetsService.availabilityHandler,
    timesheetHandler: googleSheetsService.timesheetHandler,
  },
});
apiService.addDependencies(apiServiceDependencies);

app.synth();
