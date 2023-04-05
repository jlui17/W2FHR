import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { Duration, Stack } from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export class GoogleSheetsService extends Stack {
  public readonly availabilityHandler: GoFunction;
  public readonly timesheetHandler: GoFunction;
  public readonly authHandler: GoFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    const SOURCE_DIR = "src/GoogleSheets";
    const MODULE_DIR = `${SOURCE_DIR}/go.mod`;
    const SOURCE_PACKAGES_DIR = `${SOURCE_DIR}/packages`;

    const G_CLOUD_CONFIG = Secret.fromSecretNameV2(
      this,
      "G_CLOUD_CONFIG_SECRET",
      "G_SERVICE_CONFIG"
    );

    this.availabilityHandler = new GoFunction(
      this,
      "GoogleSheetsAvailabilityHandler",
      {
        entry: `${SOURCE_PACKAGES_DIR}/availability`,
        moduleDir: MODULE_DIR,
        timeout: Duration.seconds(5),
        environment: {
          G_SERVICE_CONFIG_JSON: G_CLOUD_CONFIG.secretValue.unsafeUnwrap(),
        },
      }
    );

    this.timesheetHandler = new GoFunction(
      this,
      "GoogleSheetsTimesheetHandler",
      {
        entry: `${SOURCE_PACKAGES_DIR}/timesheet`,
        moduleDir: MODULE_DIR,
        timeout: Duration.seconds(10),
        environment: {
          G_SERVICE_CONFIG_JSON: G_CLOUD_CONFIG.secretValue.unsafeUnwrap(),
        },
      }
    );

    this.authHandler = new GoFunction(
      this,
      "GoogleSheetsGetEmployeeIdHandler",
      {
        entry: `${SOURCE_PACKAGES_DIR}/auth`,
        moduleDir: MODULE_DIR,
        environment: {
          G_SERVICE_CONFIG_JSON: G_CLOUD_CONFIG.secretValue.unsafeUnwrap(),
        },
      }
    );

    new GoFunction(this, "Test", {
      entry: `${SOURCE_PACKAGES_DIR}/test`,
      moduleDir: MODULE_DIR,
      environment: {
        G_SERVICE_CONFIG_JSON: G_CLOUD_CONFIG.secretValue.unsafeUnwrap(),
      },
    });
  }
}
