import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandOutput,
  SignUpCommand,
  SignUpCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import get from "axios";
import { getAuthApiUrlForEmail } from "../../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../../common/constants";

const USER_POOL_DATA = {
  UserPoolId: "us-west-2_PVy3K8kAW",
  ClientId: "1g3gnedq2i6naqdjrbsq10pb54",
};

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
      return Promise.reject(new Error(ERROR_MESSAGSES.SIGNUP_ERROR));
    }

    return Promise.resolve(!signUpResponse.UserConfirmed);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getEmployeeIdFromEmail = async (email: string): Promise<string> => {
  const response = await get(getAuthApiUrlForEmail(email));

  switch (response.status) {
    case 200:
      if (typeof response.data !== "string") {
        return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
      }
      return Promise.resolve(response.data);
    case 404:
      return Promise.reject(new Error(ERROR_MESSAGSES.EMPLOYEE_NOT_FOUND));
    default:
      return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
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
