import { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { useMutation } from "react-query";
import { getAuthApiUrlForResetPassword } from "../../common/ApiUrlUtil";
import { API_URLS, ERROR_MESSAGES } from "../../common/constants";

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
  if (p.length < 8) {
    res.push("At least 8 characters long");
  }
  return res;
}

export const useSignUp = (p: {
  onSuccess: (data: any) => void;
  onError: (err: unknown) => void;
}) => {
  async function signUp(email: string, password: string): Promise<any> {
    password = password.trim();
    const pErrs: string[] = validatePassword(password);
    if (pErrs.length != 0) {
      return Promise.reject(new InvalidPasswordException(pErrs));
    }

    const response: Response = await fetch(API_URLS.EMPLOYEE, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      mode: "cors",
      body: JSON.stringify({ email: email, password: password }),
    });

    switch (response.status) {
      case 201:
        const data = await response.json();
        return Promise.resolve(data);
      case 400:
      case 401:
      case 404:
        const err = await response.text();
        return Promise.reject(new Error(err));
      case 500:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }
  }
  return useMutation({
    mutationFn: (p: { email: string; password: string }) =>
      signUp(p.email, p.password),
    onSuccess: p.onSuccess,
    onError: p.onError,
  });
};

interface ConfirmAccountParams {}

export const useConfirmAccount = (p: {
  onSuccess: (data: any) => void;
  onError: (err: unknown) => void;
}) => {
  const confirmAccount = async (
    email: string,
    confirmationCode: string
  ): Promise<any> => {
    const response = await fetch(API_URLS.VERIFY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code: confirmationCode }),
    });
    switch (response.status) {
      case 200:
        return Promise.resolve(200);
      case 400:
        let err: string = await response.text();
        return Promise.reject(new Error(err));
      case 500:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));

      default:
        return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }
  };

  return useMutation(
    (p: { email: string; confirmationCode: string }) =>
      confirmAccount(p.email, p.confirmationCode),
    {
      onSuccess: p.onSuccess,
      onError: p.onError,
    }
  );
};

interface ConfirmAccountParams {
  email: string;
  idToken: string;
}

export const resendSignupVerificationCode = async (
  email: string
): Promise<void> => {
  const url = new URL(API_URLS.VERIFY);
  url.searchParams.append("email", email);
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  switch (response.status) {
    case 200:
      return;
    case 400:
    case 404:
      let err: string = await response.text();
      return Promise.reject(new Error(err));
    case 500:
      return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
    default:
      return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
  }
};

export function useLogin(
  onSuccess: (data: AuthenticationResultType) => void,
  onError: (err: unknown) => void
) {
  const login = async (
    email: string,
    password: string,
    refreshToken?: string
  ): Promise<AuthenticationResultType> => {
    const body: {
      email: string;
      password: string;
      refreshToken?: string;
    } = { email: email, password: password };
    if (refreshToken != undefined) body.refreshToken = refreshToken;

    const response = await fetch(API_URLS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return Promise.resolve(data);
      case 400:
        let err: string = await response.text();
        return Promise.reject(new Error(err));
      case 500:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }
  };

  return useMutation({
    mutationFn: (v: {
      email: string;
      password: string;
      refreshToken?: string;
    }) => login(v.email, v.password, v.refreshToken),
    onSuccess: onSuccess,
    onError: onError,
  });
}

interface PasswordParams {
  email: string;
  onSuccess: (data: any) => void;
  onError: (err: unknown) => void;
}

export const initiatePasswordReset = ({
  email,
  onSuccess,
  onError,
}: PasswordParams) => {
  const reset = async (): Promise<any> => {
    const response = await fetch(getAuthApiUrlForResetPassword(email), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    switch (response.status) {
      case 200:
        return Promise.resolve(200);
      case 400:
      case 404:
        const err: string = await response.text();
        return Promise.reject(new Error(err));
      case 500:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));

      default:
        return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }
  };

  return useMutation(reset, {
    onSuccess,
    onError,
  });
};

interface ConfirmPasswordResetParams {
  email: string;
  verificationCode: string;
  newPassword: string;
  idToken: string;
  onSuccess: (data: any) => void;
  onError: (err: unknown) => void;
}

export const confirmPasswordReset = ({
  email,
  verificationCode,
  newPassword,
  idToken,
  onSuccess,
  onError,
}: ConfirmPasswordResetParams) => {
  const confirm = async (): Promise<any> => {
    newPassword = newPassword.trim();
    const pErrs: string[] = validatePassword(newPassword);
    if (pErrs.length != 0) {
      return Promise.reject(new InvalidPasswordException(pErrs));
    }

    const response = await fetch(API_URLS.PASSWORD, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        email,
        code: verificationCode,
        password: newPassword,
      }),
    });

    switch (response.status) {
      case 200:
        return Promise.resolve(200);
      case 400:
        let err: string = await response.text();
        return Promise.reject(new Error(err));
      case 500:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));

      default:
        return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }
  };

  return useMutation(confirm, {
    onSuccess,
    onError,
  });
};
