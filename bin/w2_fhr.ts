#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { ApiService } from "../lib/services/ApiService";
import { AuthService } from "../lib/services/AuthService";
import { FrontendService } from "../lib/services/FrontendService";

const app = new cdk.App();
const authService = new AuthService(app, "AuthService");

const apiService = new ApiService(app, "ApiService", {
  AuthService: {
    userPool: authService.userPool,
  },
});

const frontendService = new FrontendService(app, "FrontendService");

app.synth();
