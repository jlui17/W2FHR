import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class DeploymentPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const githubSource = CodePipelineSource.gitHub("jlui17/W2FHR", "main", {
      authentication: SecretValue.secretsManager("GITHUB_ACCESS_TOKEN"),
    });

    const pipeline = new CodePipeline(this, "W2FHR-Pipeline", {
      pipelineName: "W2FHR-Deployment-Pipeline",
      synth: new ShellStep("W2FHR-CDK-Synth", {
        input: githubSource,
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });
  }
}
