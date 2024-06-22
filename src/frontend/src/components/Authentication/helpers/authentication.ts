import { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { useMutation, UseMutationResult } from "react-query";
import { getAuthApiUrlForResetPassword } from "../../common/ApiUrlUtil";
import { API_URLS, ERROR_MESSAGES } from "../../common/constants";

interface SignUpResponse {
  needsConfirmation: boolean;
}
function isSignUpResponse(data: unknown): data is SignUpResponse {
  return data instanceof Object && "needsConfirmation" in data;
}
interface SignUpParams {
  email: string;
  password: string;
}

export function useSignUp(p: {
  onSuccess: (data: SignUpResponse) => void;
  onError: (err: Error) => void;
}): UseMutationResult<SignUpResponse, Error, SignUpParams, unknown> {
  async function signUp(p: SignUpParams): Promise<SignUpResponse> {
    const response: Response = await fetch(API_URLS.EMPLOYEE, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      mode: "cors",
      body: JSON.stringify(p),
    });

    switch (response.status) {
      case 201:
        const data = await response.json();
        if (isSignUpResponse(data)) {
          return Promise.resolve(data);
        } else {
          const errMsg: string = `Unexpected response: ${data}`;
          console.error(errMsg);
          Promise.reject(new Error("errMsg"));
        }
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
    mutationFn: (p: SignUpParams) => signUp(p),
    onSuccess: p.onSuccess,
    onError: p.onError,
  });
}

interface ConfirmAccountParams {
  email: string;
  code: string;
}
export function useConfirmAccount(p: {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}): UseMutationResult<void, unknown, ConfirmAccountParams, unknown> {
  async function confirmAccount(p: ConfirmAccountParams): Promise<void> {
    const response = await fetch(API_URLS.VERIFY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(p),
    });

    switch (response.status) {
      case 200:
        return Promise.resolve();
      case 400:
        let err: string = await response.text();
        return Promise.reject(new Error(err));
      case 500:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));

      default:
        return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }
  }

  return useMutation({
    mutationFn: (p: ConfirmAccountParams) => confirmAccount(p),
    onSuccess: p.onSuccess,
    onError: p.onError,
  });
}

interface SendConfirmationCodeParams {
  email: string;
}
export async function resendSignupVerificationCode(
  p: SendConfirmationCodeParams
): Promise<void> {
  const url = new URL(API_URLS.VERIFY);
  url.searchParams.append("email", p.email);
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  switch (response.status) {
    case 200:
      return Promise.resolve();
    case 400:
    case 404:
      let err: string = await response.text();
      return Promise.reject(new Error(err));
    case 500:
      return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
    default:
      return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
  }
}

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
