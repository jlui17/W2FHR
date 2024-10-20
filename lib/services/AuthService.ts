import { aws_cognito, Duration, Stack } from "aws-cdk-lib";
import {
  CfnUserPoolGroup,
  UserPool,
  UserPoolClient,
  VerificationEmailStyle,
} from "aws-cdk-lib/aws-cognito";
import { IGrantable } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class AuthService extends Stack {
  public readonly userPool: UserPool;
  public readonly newUserPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  public readonly attendantGroup: CfnUserPoolGroup;
  public readonly supervisorGroup: CfnUserPoolGroup;
  public readonly managerGroup: CfnUserPoolGroup;

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
        availabilityRow: new aws_cognito.NumberAttribute(),
      },
      userVerification: {
        emailSubject: "[Wun2Free Entertainment] Verify your email address",
        emailBody:
          "Your verification code is {####}. Please enter it in the verification page to complete your registration.",
        emailStyle: VerificationEmailStyle.CODE,
      },
    });

    this.newUserPool = new UserPool(this, props.userPoolName + 2025, {
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
        availabilityRow: new aws_cognito.StringAttribute(),
      },
      userVerification: {
        emailSubject: "[Wun2Free Entertainment] Verify your email address",
        emailBody:
          "Your verification code is {####}. Please enter it in the verification page to complete your registration.",
        emailStyle: VerificationEmailStyle.CODE,
      },
    });

    this.attendantGroup = new CfnUserPoolGroup(this, "AttendantGroup", {
      groupName: "attendants",
      userPoolId: this.userPool.userPoolId,
    });

    this.supervisorGroup = new CfnUserPoolGroup(this, "SupervisorGroup", {
      groupName: "supervisors",
      userPoolId: this.userPool.userPoolId,
    });

    this.managerGroup = new CfnUserPoolGroup(this, "ManagerGroup", {
      groupName: "managers",
      userPoolId: this.userPool.userPoolId,
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

  grantAuthHandlerRequiredPermissions(handler: IGrantable) {
    this.userPool.grant(handler, "cognito-idp:AdminAddUserToGroup");
  }
}
