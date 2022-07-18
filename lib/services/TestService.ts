import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class TestService extends Construct {
  public readonly testHandler: Function;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.testHandler = new GoFunction(this, "GoTestHandler", {
      entry: "../../src/test",
    });
  }
}
