#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DeploymentPipelineStack } from "../lib/stacks/DeploymentPipelineStack";

const app = new cdk.App();
new DeploymentPipelineStack(app, "W2FHR-Deployment-Pipeline-Stack", {
  env: {
    account: "268847659094",
    region: "us-west-2",
  },
});

app.synth();
