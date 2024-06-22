import { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { useMutation, UseMutationResult } from "react-query";
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
  onError: (err: Error) => void;
}): UseMutationResult<void, Error, ConfirmAccountParams, unknown> {
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
export function useSendSignUpConfirmationCode(p: {
  onSuccess: () => void;
  onError: (err: Error) => void;
}): UseMutationResult<void, Error, SendConfirmationCodeParams, unknown> {
  async function getConfirmationCode(
    p: SendConfirmationCodeParams
  ): Promise<void> {
    const url: URL = new URL(API_URLS.VERIFY);
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

  return useMutation({
    mutationFn: (p: SendConfirmationCodeParams) => getConfirmationCode(p),
    onSuccess: p.onSuccess,
    onError: p.onError,
  });
}
export class NotConfirmedException extends Error {}
interface LoginParams {
  email: string;
  password: string;
  refreshToken?: string;
}
export function useLogin(
  onSuccess: (data: AuthenticationResultType) => void,
  onError: (err: Error) => void
): UseMutationResult<AuthenticationResultType, Error, LoginParams, unknown> {
  const login = async (p: LoginParams): Promise<AuthenticationResultType> => {
    const response = await fetch(API_URLS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(p),
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return Promise.resolve(data);
      case 400:
        let err: string = await response.text();
        if (err.includes("not confirmed")) {
          return Promise.reject(new NotConfirmedException());
        }
        return Promise.reject(new Error(err));
      case 500:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }
  };

  return useMutation({
    mutationFn: (v: LoginParams) => login(v),
    onSuccess: onSuccess,
    onError: onError,
  });
}

interface InitPasswordResetParams {
  email: string;
}
export function initiatePasswordReset(p: {
  onSuccess: () => void;
  onError: (err: Error) => void;
}): UseMutationResult<void, Error, InitPasswordResetParams, unknown> {
  async function reset(p: InitPasswordResetParams): Promise<void> {
    const url: URL = new URL(API_URLS.PASSWORD);
    url.searchParams.append("email", p.email);
    const response = await fetch(url, {
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
        const err: string = await response.text();
        return Promise.reject(new Error(err));
      case 500:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));

      default:
        return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }
  }

  return useMutation({
    mutationFn: (p: InitPasswordResetParams) => reset(p),
    onSuccess: p.onSuccess,
    onError: p.onError,
  });
}

interface ConfirmPasswordResetParams {
  email: string;
  code: string;
  password: string;
}
export function confirmPasswordReset(p: {
  onSuccess: () => void;
  onError: (err: Error) => void;
}) {
  async function confirm(p: ConfirmPasswordResetParams): Promise<void> {
    const response = await fetch(API_URLS.PASSWORD, {
      method: "POST",
      mode: "cors",
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
    mutationFn: (p: ConfirmPasswordResetParams) => confirm(p),
    onSuccess: p.onSuccess,
    onError: p.onError,
  });
}
