import {
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import get from "axios";
import { getAuthApiUrlForEmail } from "../../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../../common/constants";

const USER_POOL_DATA = {
  UserPoolId: "us-west-2_PVy3K8kAW",
  ClientId: "1g3gnedq2i6naqdjrbsq10pb54",
};
const createUserPool = () => {
  return new CognitoUserPool(USER_POOL_DATA);
};

export const signUp = async (email: string, password: string) => {
  try {
    const userPool = createUserPool();

    const employeeId = await getEmployeeIdFromEmail(email);
    const employeeIdAttribute = new CognitoUserAttribute({
      Name: "custom:employeeId",
      Value: employeeId,
    });

    const user = await new Promise((resolve, reject) => {
      userPool.signUp(
        email,
        password,
        [employeeIdAttribute],
        [],
        (err, result) => {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        }
      );
    });
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
