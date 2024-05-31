import { useMutation, useQuery } from "react-query";
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

    switch (response.status) {
      case 201:
        const data = await response.json();
        return Promise.resolve(data);
      case 400:
      case 401:
        const err = await response.text();
        return Promise.reject(new Error(err));
      case 500:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
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
        let err: string = await response.text();
        return Promise.reject(new Error(err));
      case 500:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));

      default:
        return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
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
      case 400:
        let err: string = await response.text();
        return Promise.reject(new Error(err));
      case 500:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }
  };

  return useMutation(login, {
    onSuccess,
    onError,
  });
};

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
