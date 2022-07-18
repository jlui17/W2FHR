import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

export class TestService extends Construct {
  public readonly testHandler: Function;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.testHandler = new GoFunction(this, "GoTestHandler", {
      entry: path.join(__dirname, "../../src/test/packages"),
      moduleDir: path.join(__dirname, "../../src/test/go.mod"),
    });
  }
}
