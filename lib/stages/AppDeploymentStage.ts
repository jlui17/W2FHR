import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiService } from "../services/ApiService";
import { GoogleSheetsService } from "../services/GoogleSheetsService";

export class AppDeploymentStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const testStack = new GoogleSheetsService(this, "TestStack");
    const apiServiceDependencies = [testStack];

    const apiService = new ApiService(this, "ApiService", {
      testHandler: testStack.testHandler,
    });
    apiService.addDependencies(apiServiceDependencies);
  }
}
