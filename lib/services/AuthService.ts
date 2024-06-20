import { aws_cognito, Duration, Stack } from "aws-cdk-lib";
import {
  UserPool,
  UserPoolClient,
  VerificationEmailStyle,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class AuthService extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(
    scope: Construct,
    id: string,
    props: {
      userPoolName: string;
    }
  ) {
    super(scope, id);

    this.userPool = new UserPool(this, props.userPoolName, {
      userPoolName: props.userPoolName,
      selfSignUpEnabled: true,
      signInCaseSensitive: false,
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
          "Your verification code is {####}. Please enter it in the verification page to complete your registration.",
        emailStyle: VerificationEmailStyle.CODE,
      },
    });

    this.userPoolClient = this.userPool.addClient(
      props.userPoolName + "-client",
      {
        userPoolClientName: props.userPoolName + "-client",
        generateSecret: false,
        authFlows: {
          userPassword: true,
        },
        idTokenValidity: Duration.days(1),
      }
    );
    this.userPool.addDomain(props.userPoolName + "-domain", {
      cognitoDomain: {
        domainPrefix: props.userPoolName + "-wun2free",
      },
    });
  }
}
