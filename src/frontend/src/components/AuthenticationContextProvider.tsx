import { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import jwtDecode from "jwt-decode";
import { createContext, ReactNode, useState } from "react";

interface AuthenticationContextProviderProps {
  children: ReactNode;
}

const getInitialAuthenticationContext = (): {
  getAuthSession: () => AuthenticationResultType | null;
  saveAuthSession: (authSession: AuthenticationResultType | null) => void;
  isLoggedIn: boolean;
} => {
  return {
    getAuthSession: () => null,
    saveAuthSession: (authSession: AuthenticationResultType | null) => {},
    isLoggedIn: true,
  };
};

export const AuthenticationContext = createContext(
  getInitialAuthenticationContext()
);

interface IdToken {
  exp: number;
}
const idTokenIsExpired = (idToken: string | undefined): boolean => {
  if (idToken === undefined) {
    return true;
  }
  try {
    const idTokenPayload: IdToken = jwtDecode(idToken);
    const idTokenExpiration = idTokenPayload.exp;
    const now = Math.floor(Date.now() / 1000);
    return idTokenExpiration < now;
  } catch (err) {
    return true;
  }
};

const getAuthSessionFromLocalStorage = (): AuthenticationResultType | null => {
  const savedAuthSession = localStorage.getItem("authSession");
  if (savedAuthSession) {
    const authSession: AuthenticationResultType = JSON.parse(savedAuthSession);
    if (!idTokenIsExpired(authSession.IdToken!)) {
      return authSession;
    }
  }
  return null;
};

export const AuthenticationContextProvider = ({
  children,
}: AuthenticationContextProviderProps) => {
  const [authSession, setAuthSession] =
    useState<AuthenticationResultType | null>(null);

  const saveAuthSession = (authSession: AuthenticationResultType | null) => {
    setAuthSession(authSession);
    localStorage.setItem("authSession", JSON.stringify(authSession));
  };

  const getAuthSession = () => {
    if (authSession) {
      return authSession;
    }

    return getAuthSessionFromLocalStorage();
  };

  const isLoggedIn = getAuthSession() !== null;

  return (
    <AuthenticationContext.Provider
      value={{ getAuthSession, saveAuthSession, isLoggedIn }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
