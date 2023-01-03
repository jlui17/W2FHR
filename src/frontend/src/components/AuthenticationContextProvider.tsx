import { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { createContext, ReactNode, useState } from "react";

interface AuthenticationContextProviderProps {
  children: ReactNode;
}

const getInitialAuthenticationContext = (): {
  authSession: AuthenticationResultType | null;
  setAuthSession: (authSession: AuthenticationResultType | null) => void;
} => {
  return {
    authSession: null,
    setAuthSession: (authSession: AuthenticationResultType | null) => {},
  };
};

export const AuthenticationContext = createContext(
  getInitialAuthenticationContext()
);

export const AuthenticationContextProvider = ({
  children,
}: AuthenticationContextProviderProps) => {
  const [authSession, setAuthSession] =
    useState<AuthenticationResultType | null>(null);

  return (
    <AuthenticationContext.Provider value={{ authSession, setAuthSession }}>
      {children}
    </AuthenticationContext.Provider>
  );
};
