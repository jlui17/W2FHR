import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { SecretValue, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

export class GoogleSheetsService extends Stack {
  public readonly testHandler: GoFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    const FUNCTION_FOLDER = "src/GoogleSheets";

    const GOOGLE_API_KEY =
      SecretValue.secretsManager("GOOGLE_API_KEY").unsafeUnwrap();

    this.testHandler = new GoFunction(this, "GoTestHandler", {
      entry: `${FUNCTION_FOLDER}/packages`,
      moduleDir: `${FUNCTION_FOLDER}/go.mod`,
      environment: {
        GOOGLE_API_KEY: GOOGLE_API_KEY,
      },
    });
  }
}
