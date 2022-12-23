import { aws_cognito, Stack } from "aws-cdk-lib";
import { UserPool, VerificationEmailStyle } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class AuthService extends Stack {
  public readonly userPool: UserPool;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.userPool = new UserPool(this, "employees", {
      userPoolName: "employees",
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        employeeId: new aws_cognito.StringAttribute(),
      },
      userVerification: {
        emailSubject: "[Wun2Free Entertainment] Verify your email address",
        emailBody:
          "Congratulations! Your onboarding is almost complete. Once you are verified, you are all setup for the upcoming season. \n\nYour verification code is {####}",
        emailStyle: VerificationEmailStyle.CODE,
      },
    });

    this.userPool.addClient("employees-client", {
      userPoolClientName: "employees-client",
      generateSecret: false,
    });
    this.userPool.addDomain("employees-domain", {
      cognitoDomain: {
        domainPrefix: "employees-wun2free",
      },
    });
  }
}
