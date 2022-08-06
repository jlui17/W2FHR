import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class AppDeploymentStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    // const googleSheetsService = new GoogleSheetsService(
    //   this,
    //   "GoogleSheetsService"
    // );
    // const apiServiceDependencies = [googleSheetsService];

    // const apiService = new ApiService(this, "ApiService", {
    //   testHandler: googleSheetsService.testHandler,
    // });
    // apiService.addDependencies(apiServiceDependencies);
  }
}
