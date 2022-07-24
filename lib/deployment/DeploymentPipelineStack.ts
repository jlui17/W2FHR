import { Stack, StackProps } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { AppDeploymentStage } from "../stages/AppDeploymentStage";

export class DeploymentPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const source = CodePipelineSource.connection("jlui17/W2FHR", "main", {
      connectionArn:
        "arn:aws:codestar-connections:us-west-2:268847659094:connection/984f5815-f474-4f0b-8cb0-a2c85d41bebe",
    });

    const pipeline = new CodePipeline(this, "W2FHRDeploymentPipeline", {
      pipelineName: "W2FHRDeploymentPipeline",
      synth: new ShellStep("Synth", {
        input: source,
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    pipeline.addStage(new AppDeploymentStage(this, "AppDeploymenStage"));
  }
}
