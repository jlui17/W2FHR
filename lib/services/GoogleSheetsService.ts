import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { SecretValue, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

export class GoogleSheetsService extends Stack {
  public readonly testHandler: GoFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    const FUNCTION_FOLDER = "src/GoogleSheets";

    const PROJECT_ID = SecretValue.secretsManager(
      "GOOGLE_AUTH_PROJECT_ID"
    ).unsafeUnwrap();
    const PRIVATE_KEY_ID = SecretValue.secretsManager(
      "GOOGLE_AUTH_PRIVATE_KEY_ID"
    ).unsafeUnwrap();
    const PRIVATE_KEY = SecretValue.secretsManager(
      "GOOGLE_AUTH_PRIVATE_KEY"
    ).unsafeUnwrap();
    const CLIENT_EMAIL = SecretValue.secretsManager(
      "GOOGLE_AUTH_CLIENT_EMAIL"
    ).unsafeUnwrap();
    const CLIENT_ID = SecretValue.secretsManager(
      "GOOGLE_AUTH_CLIENT_ID"
    ).unsafeUnwrap();
    const AUTH_URI =
      SecretValue.secretsManager("GOOGLE_AUTH_URI").unsafeUnwrap();
    const TOKEN_URI = SecretValue.secretsManager(
      "GOOGLE_AUTH_TOKEN_URI"
    ).unsafeUnwrap();
    const AUTH_PROVIDER_CERT_URL = SecretValue.secretsManager(
      "GOOGLE_AUTH_PROVIDER_CERT_URL"
    ).unsafeUnwrap();
    const CLIENT_CERT_URL = SecretValue.secretsManager(
      "GOOGLE_AUTH_CLIENT_CERT_URL"
    ).unsafeUnwrap();

    this.testHandler = new GoFunction(this, "GoTestHandler", {
      entry: `${FUNCTION_FOLDER}/packages`,
      moduleDir: `${FUNCTION_FOLDER}/go.mod`,
      environment: {
        PROJECT_ID: PROJECT_ID,
        PRIVATE_KEY_ID: PRIVATE_KEY_ID,
        PRIVATE_KEY: PRIVATE_KEY,
        CLIENT_EMAIL: CLIENT_EMAIL,
        CLIENT_ID: CLIENT_ID,
        AUTH_URI: AUTH_URI,
        TOKEN_URI: TOKEN_URI,
        AUTH_PROVIDER_CERT_URL: AUTH_PROVIDER_CERT_URL,
        CLIENT_CERT_URL: CLIENT_CERT_URL,
      },
    });
  }
}
