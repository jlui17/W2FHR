import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { useMutation } from "react-query";
import { getAuthApiUrlForEmail } from "../../common/ApiUrlUtil";
import {
  API_URLS,
  ERROR_MESSAGES,
  RESPONSE_ERROR_MESSAGE_MAP,
} from "../../common/constants";

const COGNITO_CONFIG = {
  region: "us-west-2",
  clientId: "4kkjr0at3bjoeli3uuprqrthru",
};
const COGNITO_CLIENT = new CognitoIdentityProviderClient({
  region: "us-west-2",
});

// export const signUpAndGetNeedToConfirm = async (
//   email: string,
//   password: string
// ): Promise<boolean> => {
//   try {
//     const employeeId = await getEmployeeIdFromEmail(email);
//     const signUpResponse = await doSignUp(email, password, employeeId);
//     if (
//       signUpResponse.UserSub === undefined ||
//       signUpResponse.UserConfirmed === undefined
//     ) {
//       return Promise.reject(new Error(ERROR_MESSAGES.SIGNUP_ERROR));
//     }

//     return Promise.resolve(!signUpResponse.UserConfirmed);
//   } catch (err) {
//     return Promise.reject(err);
//   }

// };

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

export class InvalidPasswordException extends Error {
  constructor(missing: string[]) {
    let message: string = "Your password is missing the following: ";
    for (const m of missing) {
      message += m + ", ";
    }
    super(message.slice(0, -1));
  }
}
const hasLowercase: RegExp = /[a-z]/;
const hasUppercase: RegExp = /[A-Z]/;
const hasNumber: RegExp = /\d/;
// Check for at least one special character from the specified list
const hasSpecialChar: RegExp =
  /[\^\$\*\.\[\]\{\}\(\)\?\-\"!@#%&\/\\,><\':;|\_~`\+=]/;
function validatePassword(p: string): string[] {
  const res: string[] = [];
  if (!hasLowercase.test(p)) {
    res.push("1 LOWERCASE letter");
  }
  if (!hasUppercase.test(p)) {
    res.push("1 UPPERCASE letter");
  }
  if (!hasNumber.test(p)) {
    res.push("1 NUMBER");
  }
  if (!hasSpecialChar.test(p)) {
    res.push(
      "1 of the following SPECIAL CHARACTERS: ^ $ * . [ ] { } ( ) ? - \" ! @ # % & /  , > < ' : ; | _ ~ ` + = ?"
    );
  }
  return res;
}

interface SignUpParams {
  email: string;
  password: string;
  idToken: string;
  onSuccess: (data: any) => void;
  onError: (err: unknown) => void;
}
export const useSignUp = ({
  email,
  password,
  idToken,
  onSuccess,
  onError,
}: SignUpParams) => {
  const signUp = async (): Promise<any> => {
    password = password.trim();
    const pErrs: string[] = validatePassword(password);
    if (pErrs.length != 0) {
      return Promise.reject(new InvalidPasswordException(pErrs));
    }

    const response: Response = await fetch(API_URLS.EMPLOYEE, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      method: "POST",
      mode: "cors",
      body: JSON.stringify({ email, password }),
    });

    console.log("SIGN UP WENT THRU");
    const data = await response.json();
    switch (response.status) {
      case 201:
        return Promise.resolve(data);
      case 400:
      case 401:
        return Promise.reject(new Error(data));
      case 500:
        return Promise.reject(new Error("Internal server error"));
      default:
        return Promise.reject(new Error("Unknown error occurred"));
    }
  };
  return useMutation(signUp, {
    onSuccess: onSuccess,
    onError: onError,
  });
};

interface ConfirmAccountParams {
  email: string;
  verificationCode: string;
  idToken: string;
  onSuccess: (data: any) => void;
  onError: (err: unknown) => void;
}

export const useConfirmAccount = ({
  email,
  verificationCode,
  idToken,
  onSuccess,
  onError,
}: ConfirmAccountParams) => {
  const confirmAccount = async (): Promise<any> => {
    const response = await fetch(API_URLS.VERIFY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ email, code: verificationCode }),
    });

    switch (response.status) {
      case 200:
        console.log("good verify");
        return Promise.resolve(200);
      case 400:
        return Promise.reject(new Error("Invalid request"));
      case 500:
        return Promise.reject(new Error("Internal server error"));

      default:
        return Promise.reject(new Error("Unknown error occurred"));
    }
  };

  return useMutation(confirmAccount, {
    onSuccess: onSuccess,
    onError: onError,
  });
};

interface ConfirmAccountParams {
  email: string;
  idToken: string;
}

export const resendSignupVerificationCode = async (
  email: string,
  idToken: string
): Promise<void> => {
  const url = new URL(API_URLS.VERIFY);
  url.searchParams.append("email", email);
  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to resend verification code");
    }
  } catch (err) {
    throw new Error("LimitExceededException");
  }
};

// export const loginAndGetAuthSession = async (
//   email: string,
//   password: string
// ): Promise<AuthenticationResultType> => {
//   try {
//     const loginResponse = await doLogin(email, password);
//     if (loginResponse.AuthenticationResult == undefined) {
//       return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
//     }

//     return Promise.resolve(loginResponse.AuthenticationResult);
//   } catch (err) {
//     return Promise.reject(err);
//   }
// };

// const doLogin = async (
//   email: string,
//   password: string
// ): Promise<InitiateAuthCommandOutput> => {
//   const loginCommand = new InitiateAuthCommand({
//     AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
//     ClientId: COGNITO_CONFIG.clientId,
//     AuthParameters: {
//       USERNAME: email,
//       PASSWORD: password,
//     },
//   });
//   return COGNITO_CLIENT.send(loginCommand);
// };

interface LoginParams {
  email: string;
  password: string;
  idToken: string;
  onSuccess: (data: any) => void;
  onError: (err: unknown) => void;
}

export const useLogin = ({
  email,
  password,
  onSuccess,
  onError,
  idToken,
}: LoginParams) => {
  const login = async (): Promise<any> => {
    const response = await fetch(API_URLS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ email, password }),
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return Promise.resolve(data);
      case 401:
        const errorText = await response.text();
        console.log("ERROR: ", errorText);
        if (errorText.includes(ERROR_MESSAGES.EMPLOYEE_NOT_CONFIRMED)) {
          return Promise.reject(ERROR_MESSAGES.EMPLOYEE_NOT_CONFIRMED);
        } else if (errorText.includes("UserNotFound")) {
          return Promise.reject("UserNotFoundException");
        }
        return Promise.reject("Unknown Error");
      case 500:
        return Promise.reject(new Error("Internal server error"));

      default:
        return Promise.reject(new Error("Unknown error occurred"));
    }
  };

  return useMutation(login, {
    onSuccess,
    onError,
  });
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
