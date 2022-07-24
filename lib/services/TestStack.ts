import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import path = require("path");

export class TestStack extends Stack {
  public readonly testHandler: GoFunction;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);
    const FUNCTION_FOLDER = "src/test";

    this.testHandler = new GoFunction(this, "GoTestHandler", {
      entry: `${FUNCTION_FOLDER}/packages`,
      moduleDir: `${FUNCTION_FOLDER}/go.mod`,
    });
  }
}
