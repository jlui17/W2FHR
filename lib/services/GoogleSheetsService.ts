import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class GoogleSheetsService extends Stack {
  public readonly testHandler: GoFunction;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);
    const FUNCTION_FOLDER = "src/GoogleSheets";

    this.testHandler = new GoFunction(this, "GoTestHandler", {
      entry: `${FUNCTION_FOLDER}/packages`,
      moduleDir: `${FUNCTION_FOLDER}/go.mod`,
    });
  }
}
