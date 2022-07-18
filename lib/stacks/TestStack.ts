import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { TestService } from "../services/TestService";

export class TestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);

    const testService = new TestService(this, "TestService");
  }
}
