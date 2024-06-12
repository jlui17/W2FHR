import { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import jwtDecode from "jwt-decode";
import { createContext, ReactNode } from "react";

interface AuthenticationContextProviderProps {
  children: ReactNode;
}

const getInitialAuthenticationContext = (): {
  getAuthSession: () => AuthenticationResultType | null;
  saveAuthSession: (authSession: AuthenticationResultType | null) => void;
  isLoggedIn: () => boolean;
  logout: () => void;
  stayLoggedIn: () => boolean;
  setStayLoggedIn: (b: boolean) => void;
} => {
  return {
    getAuthSession: () => null,
    saveAuthSession: (authSession: AuthenticationResultType | null) => {},
    isLoggedIn: () => false,
    logout: () => null,
    stayLoggedIn: () => false,
    setStayLoggedIn: (b: boolean) => null,
  };
};

export const AuthenticationContext = createContext(
  getInitialAuthenticationContext()
);

interface IdToken {
  exp: number;
}
function idTokenIsExpired(idToken: string | undefined): boolean {
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
}

export const AuthenticationContextProvider = ({
  children,
}: AuthenticationContextProviderProps) => {
  const saveAuthSession = (authSession: AuthenticationResultType | null) => {
    localStorage.setItem("authSession", JSON.stringify(authSession));
  };

  const getAuthSession = () => {
    const savedAuthSession = localStorage.getItem("authSession");
    if (savedAuthSession) {
      const authSession: AuthenticationResultType =
        JSON.parse(savedAuthSession);
      if (!idTokenIsExpired(authSession.IdToken!)) {
        return authSession;
      }
    }
    return null;
  };

  function isLoggedIn(): boolean {
    return getAuthSession() !== null;
  }

  function logout(): void {
    localStorage.removeItem("authSession");
    setStayLoggedIn(false);
  }

  function setStayLoggedIn(b: boolean): void {
    localStorage.setItem("stayLoggedIn", b ? "yes" : "no");
  }

  function stayLoggedIn(): boolean {
    const stayLoggedIn: string | null = localStorage.getItem("stayLoggedIn");
    if (!stayLoggedIn) {
      localStorage.setItem("stayLoggedIn", "no");
      return false;
    }
    return stayLoggedIn === "yes";
  }

  return (
    <AuthenticationContext.Provider
      value={{
        getAuthSession,
        saveAuthSession,
        isLoggedIn,
        logout,
        stayLoggedIn,
        setStayLoggedIn,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
