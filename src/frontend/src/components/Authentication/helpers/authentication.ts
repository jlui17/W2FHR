import {
  AuthenticationResultType,
  AuthFlowType,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandOutput,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  InitiateAuthCommandOutput,
  ResendConfirmationCodeCommand,
  SignUpCommand,
  SignUpCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { getAuthApiUrlForEmail } from "../../common/ApiUrlUtil";
import {
  ERROR_MESSAGES,
  RESPONSE_ERROR_MESSAGE_MAP,
} from "../../common/constants";

const COGNITO_CONFIG = {
  region: "us-west-2",
  clientId: "1g3gnedq2i6naqdjrbsq10pb54",
};
const COGNITO_CLIENT = new CognitoIdentityProviderClient({
  region: "us-west-2",
});

export const signUpAndGetNeedToConfirm = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const employeeId = await getEmployeeIdFromEmail(email);

    const signUpResponse = await doSignUp(email, password, employeeId);
    if (
      signUpResponse.UserSub === undefined ||
      signUpResponse.UserConfirmed === undefined
    ) {
      return Promise.reject(new Error(ERROR_MESSAGES.SIGNUP_ERROR));
    }

    return Promise.resolve(!signUpResponse.UserConfirmed);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getEmployeeIdFromEmail = async (email: string): Promise<string> => {
  const response = await fetch(getAuthApiUrlForEmail(email));
  const data = await response.text();

  switch (response.status) {
    case 200:
      if (typeof data !== "string") {
        return Promise.reject(
          new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT)
        );
      }
      return Promise.resolve(data);
    default:
      const errorMessage = RESPONSE_ERROR_MESSAGE_MAP[data];
      if (errorMessage !== undefined) {
        return Promise.reject(new Error(errorMessage));
      }
      return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
  }
};

const doSignUp = async (
  email: string,
  password: string,
  employeeId: string
): Promise<SignUpCommandOutput> => {
  const signUpCommand = new SignUpCommand({
    ClientId: COGNITO_CONFIG.clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: "custom:employeeId",
        Value: employeeId,
      },
    ],
  });

  return COGNITO_CLIENT.send(signUpCommand);
};

export const confirmAccount = async (
  email: string,
  verificationCode: string
): Promise<ConfirmSignUpCommandOutput> => {
  const confirmSignUpCommand = new ConfirmSignUpCommand({
    ClientId: COGNITO_CONFIG.clientId,
    Username: email,
    ConfirmationCode: verificationCode,
  });

  return COGNITO_CLIENT.send(confirmSignUpCommand);
};

export const resendSignupVerificationCode = async (
  email: string
): Promise<void> => {
  const resendConfirmationCodeCommand = new ResendConfirmationCodeCommand({
    ClientId: COGNITO_CONFIG.clientId,
    Username: email,
  });

  try {
    await COGNITO_CLIENT.send(resendConfirmationCodeCommand);
  } catch (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

export const loginAndGetAuthSession = async (
  email: string,
  password: string
): Promise<AuthenticationResultType> => {
  try {
    const loginResponse = await doLogin(email, password);
    if (loginResponse.AuthenticationResult == undefined) {
      return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }

    return Promise.resolve(loginResponse.AuthenticationResult);
  } catch (err) {
    return Promise.reject(err);
  }
};

const doLogin = async (
  email: string,
  password: string
): Promise<InitiateAuthCommandOutput> => {
  const loginCommand = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: COGNITO_CONFIG.clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });
  return COGNITO_CLIENT.send(loginCommand);
};

export const initiatePasswordReset = async (email: string): Promise<void> => {
  try {
    const forgotPasswordCommand = new ForgotPasswordCommand({
      ClientId: COGNITO_CONFIG.clientId,
      Username: email,
    });

    await COGNITO_CLIENT.send(forgotPasswordCommand);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
};

export const confirmPasswordReset = async (
  email: string,
  newPassword: string,
  verificationCode: string
) => {
  try {
    const confirmPasswordResetCommand = new ConfirmForgotPasswordCommand({
      ClientId: COGNITO_CONFIG.clientId,
      Username: email,
      ConfirmationCode: verificationCode,
      Password: newPassword,
    });

    await COGNITO_CLIENT.send(confirmPasswordResetCommand);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
};
