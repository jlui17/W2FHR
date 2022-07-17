import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class DeploymentPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const GITHUB_AUTH_TOKEN = SecretValue.secretsManager("GITHUB_ACCESS_TOKEN");

    const pipeline = new CodePipeline(this, "W2FHRDeploymentPipeline", {
      pipelineName: "W2FHRDeploymentPipeline",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub("jlui17/W2FHR", "main", {
          authentication: GITHUB_AUTH_TOKEN,
        }),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });
  }
}
