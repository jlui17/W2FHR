import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

export class GoogleSheetsService extends Stack {
  public readonly availabilityHandler: GoFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    const SOURCE_DIR = "src/GoogleSheets";
    const MODULE_DIR = `${SOURCE_DIR}/go.mod`;
    const SOURCE_PACKAGES_DIR = `${SOURCE_DIR}/packages`;

    this.availabilityHandler = new GoFunction(
      this,
      "GoogleSheetsAvailabilityHandler",
      {
        entry: `${SOURCE_PACKAGES_DIR}/availability`,
        moduleDir: MODULE_DIR,
      }
    );
  }
}
