import {
  CognitoUserAttribute,
  CognitoUserPool,
  ISignUpResult,
} from "amazon-cognito-identity-js";
import get from "axios";
import { getAuthApiUrlForEmail } from "../../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../../common/constants";

const USER_POOL_DATA = {
  UserPoolId: "us-west-2_PVy3K8kAW",
  ClientId: "1g3gnedq2i6naqdjrbsq10pb54",
};
const USER_POOL = new CognitoUserPool(USER_POOL_DATA);

export const signUp = async (
  email: string,
  password: string
): Promise<ISignUpResult> => {
  try {
    const employeeId = await getEmployeeIdFromEmail(email);

    const user = await doSignUp(email, password, employeeId);
    return Promise.resolve(user);
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
): Promise<ISignUpResult> => {
  const employeeIdAttribute = new CognitoUserAttribute({
    Name: "custom:employeeId",
    Value: employeeId,
  });

  return new Promise<ISignUpResult>((resolve, reject) => {
    USER_POOL.signUp(
      email,
      password,
      [employeeIdAttribute],
      [],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        if (result === undefined) {
          return reject(new Error(ERROR_MESSAGSES.REGISTRATION_ERROR));
        }
        return resolve(result);
      }
    );
  });
};
