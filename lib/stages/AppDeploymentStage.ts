import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { TestStack } from "../services/TestStack";

export class AppDeploymentStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const testStack = new TestStack(this, "TestStack");
  }
}
