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
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { AuthService } from "./AuthService";

export class ApiService extends Stack {
  public readonly api: RestApi;

  constructor(
    scope: Construct,
    id: string,
    props: { authService: AuthService }
  ) {
    super(scope, id);

    const SOURCE_DIR = "src/GoogleSheets";
    const MODULE_DIR = `${SOURCE_DIR}/go.mod`;
    const SOURCE_PACKAGES_DIR = `${SOURCE_DIR}/packages`;

    const G_CLOUD_CONFIG = Secret.fromSecretNameV2(
      this,
      "G_CLOUD_CONFIG_SECRET",
      "G_SERVICE_CONFIG"
    );
    const COGNITO_ATTENDANTS_GROUP_NAME = props.authService.attendantGroup.groupName || "";
    const COGNITO_SUPERVISORS_GROUP_NAME = props.authService.supervisorGroup.groupName || "";
    const COGNITO_MANAGERS_GROUP_NAME = props.authService.managerGroup.groupName || "";

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
        entry: `${SOURCE_PACKAGES_DIR}/schedule`,
        moduleDir: MODULE_DIR,
        timeout: Duration.seconds(10),
        environment: {
          G_SERVICE_CONFIG_JSON: G_CLOUD_CONFIG.secretValue.unsafeUnwrap(),
          COGNITO_ATTENDANTS_GROUP_NAME: COGNITO_ATTENDANTS_GROUP_NAME,
          COGNITO_SUPERVISORS_GROUP_NAME: COGNITO_SUPERVISORS_GROUP_NAME,
          COGNITO_MANAGERS_GROUP_NAME: COGNITO_MANAGERS_GROUP_NAME,
        },
      }
    );

    const authHandler: GoFunction = new GoFunction(
      this,
      "GoogleSheetsGetEmployeeIdHandler",
      {
        entry: `${SOURCE_PACKAGES_DIR}/auth`,
        moduleDir: MODULE_DIR,
        timeout: Duration.seconds(10),
        environment: {
          G_SERVICE_CONFIG_JSON: G_CLOUD_CONFIG.secretValue.unsafeUnwrap(),
          COGNITO_POOL_ID: props.authService.userPool.userPoolId,
          COGNITO_CLIENT_ID: props.authService.userPoolClient.userPoolClientId,
          COGNITO_ATTENDANTS_GROUP_NAME:
            props.authService.attendantGroup.groupName || "",
          COGNITO_SUPERVISORS_GROUP_NAME:
            props.authService.supervisorGroup.groupName || "",
          COGNITO_MANAGERS_GROUP_NAME:
            props.authService.managerGroup.groupName || "",
        },
      }
    );
    props.authService.grantAuthHandlerRequiredPermissions(authHandler);

    const schedulingHandler: GoFunction = new GoFunction(
        this,
        "GoogleSheetsSchedulingHandler",
        {
          entry: `${SOURCE_PACKAGES_DIR}/scheduling`,
          moduleDir: MODULE_DIR,
          timeout: Duration.seconds(10),
          environment: {
            G_SERVICE_CONFIG_JSON: G_CLOUD_CONFIG.secretValue.unsafeUnwrap(),
            COGNITO_ATTENDANTS_GROUP_NAME:
              props.authService.attendantGroup.groupName || "",
            COGNITO_SUPERVISORS_GROUP_NAME:
              props.authService.supervisorGroup.groupName || "",
            COGNITO_MANAGERS_GROUP_NAME:
              props.authService.managerGroup.groupName || "",
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
        allowMethods: ["GET", "POST", "PUT"],
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
        cognitoUserPools: [props.authService.userPool],
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

    const schedulingRoute = api.root.addResource("scheduling");
    schedulingRoute.addMethod("GET", new LambdaIntegration(schedulingHandler), {
      authorizer,
      authorizationType: AuthorizationType.COGNITO,
    });
    schedulingRoute.addMethod("PUT", new LambdaIntegration(schedulingHandler), {
      authorizer,
      authorizationType: AuthorizationType.COGNITO,
    });

    const baseAuthRoute = api.root.addResource("auth");
    const employeeRoute = baseAuthRoute.addResource("employee");
    employeeRoute.addMethod("POST", new LambdaIntegration(authHandler));
    const verifyRoute = baseAuthRoute.addResource("verify");
    verifyRoute.addMethod("POST", new LambdaIntegration(authHandler));
    verifyRoute.addMethod("PUT", new LambdaIntegration(authHandler));
    const loginRoute = baseAuthRoute.addResource("login");
    loginRoute.addMethod("POST", new LambdaIntegration(authHandler));
    const passwordRoute = baseAuthRoute.addResource("password");
    passwordRoute.addMethod("POST", new LambdaIntegration(authHandler));
    passwordRoute.addMethod("PUT", new LambdaIntegration(authHandler));
  }
}
