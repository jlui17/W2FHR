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

    const baseAvailabilityRoute = api.root.addResource("availability");
    const availabilityRoute = baseAvailabilityRoute.addResource("{employeeId}");
    availabilityRoute.addMethod(
      "GET",
      new LambdaIntegration(props.GoogleSheets.availabilityHandler)
    );
  }

  public addDependencies(targets: Stack[]): void {
    targets.forEach((dependency) => {
      this.addDependency(dependency);
    });
  }
}
