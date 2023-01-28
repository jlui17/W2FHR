import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { Stack } from "aws-cdk-lib";
import {
  Cors,
  LambdaIntegration,
  MethodLoggingLevel,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

interface ApiServiceProps {
  GoogleSheets: {
    availabilityHandler: GoFunction;
    timesheetHandler: GoFunction;
    authHandler: GoFunction;
  };
}

export class ApiService extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiServiceProps) {
    super(scope, id);

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

    const availabilityRoute = api.root.addResource("availability");
    availabilityRoute.addMethod(
      "GET",
      new LambdaIntegration(props.GoogleSheets.availabilityHandler)
    );
    availabilityRoute.addMethod(
      "POST",
      new LambdaIntegration(props.GoogleSheets.availabilityHandler)
    );

    const timesheetRoute = api.root.addResource("timesheet");
    timesheetRoute.addMethod(
      "GET",
      new LambdaIntegration(props.GoogleSheets.timesheetHandler)
    );

    const baseAuthRoute = api.root.addResource("auth");
    const authRoute = baseAuthRoute.addResource("{email}");
    authRoute.addMethod(
      "GET",
      new LambdaIntegration(props.GoogleSheets.authHandler)
    );
  }

  public addDependencies(targets: Stack[]): void {
    targets.forEach((dependency) => {
      this.addDependency(dependency);
    });
  }
}
