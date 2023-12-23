import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { Duration, Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  MethodLoggingLevel,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
interface ApiServiceProps {
  AuthService: {
    userPool: UserPool;
    userPoolClient: UserPoolClient;
  };
}

export class ApiService extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiServiceProps) {
    super(scope, id);

    const SOURCE_DIR = "src/GoogleSheets";
    const MODULE_DIR = `${SOURCE_DIR}/go.mod`;
    const SOURCE_PACKAGES_DIR = `${SOURCE_DIR}/packages`;

    const G_CLOUD_CONFIG = Secret.fromSecretNameV2(
      this,
      "G_CLOUD_CONFIG_SECRET",
      "G_SERVICE_CONFIG"
    );

    const availabilityHandler = new GoFunction(
      this,
      "GoogleSheetsAvailabilityHandler",
      {
        entry: `${SOURCE_PACKAGES_DIR}/availability`,
        moduleDir: MODULE_DIR,
        timeout: Duration.seconds(10),
        environment: {
          G_SERVICE_CONFIG_JSON: G_CLOUD_CONFIG.secretValue.unsafeUnwrap(),
        },
      }
    );

    const timesheetHandler = new GoFunction(
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

    const authHandler = new GoFunction(
      this,
      "GoogleSheetsGetEmployeeIdHandler",
      {
        entry: `${SOURCE_PACKAGES_DIR}/auth`,
        moduleDir: MODULE_DIR,
        timeout: Duration.seconds(10),
        environment: {
          G_SERVICE_CONFIG_JSON: G_CLOUD_CONFIG.secretValue.unsafeUnwrap(),
          COGNITO_CLIENT_ID:  props.AuthService.userPoolClient.userPoolClientId,
        },
      }
    );


    const api = new RestApi(this, "RestApi", {
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "Access-Control-Allow-Origins",
        ],
        allowMethods: ["GET", "POST", "DELETE"],
        allowCredentials: true,
        allowOrigins: Cors.ALL_ORIGINS,
      },

      deployOptions: {
        stageName: "v1",
        tracingEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
      },
    });

    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      "W2fhrApiAuthorizer",
      {
        cognitoUserPools: [props.AuthService.userPool],
      }
    );

    const availabilityRoute = api.root.addResource("availability");
    availabilityRoute.addMethod(
      "GET",
      new LambdaIntegration(availabilityHandler),
      {
        authorizer,
        authorizationType: AuthorizationType.COGNITO,
      }
    );
    availabilityRoute.addMethod(
      "POST",
      new LambdaIntegration(availabilityHandler),
      {
        authorizer,
        authorizationType: AuthorizationType.COGNITO,
      }
    );

    const timesheetRoute = api.root.addResource("timesheet");
    timesheetRoute.addMethod("GET", new LambdaIntegration(timesheetHandler), {
      authorizer,
      authorizationType: AuthorizationType.COGNITO,
    });

    const baseAuthRoute = api.root.addResource("auth");
    const authRoute = baseAuthRoute.addResource("{email}");
    authRoute.addMethod("GET", new LambdaIntegration(authHandler));
    baseAuthRoute.addMethod("POST", new LambdaIntegration(authHandler));

  }
}
