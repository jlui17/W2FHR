#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { DeploymentPipelineStack } from "../lib/deployment/DeploymentPipelineStack";

const app = new cdk.App();
new DeploymentPipelineStack(app, "W2FHRDeploymentStack", {
  env: {
    account: "268847659094",
    region: "us-west-2",
  },
});

app.synth();
