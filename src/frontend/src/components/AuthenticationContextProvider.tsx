import { jwtDecode } from "jwt-decode";
import { createContext, ReactNode } from "react";
import {
  AuthSession,
  isAuthSession,
} from "./Authentication/helpers/authentication";

interface AuthenticationContextProviderProps {
  children: ReactNode;
}

const getInitialAuthenticationContext = (): {
  getAuthSession: () => AuthSession | null;
  saveAuthSession: (authSession: AuthSession) => void;
  isLoggedIn: () => boolean;
  logout: () => void;
  stayLoggedIn: () => boolean;
  setStayLoggedIn: (b: boolean) => void;
  hasAccessToFeature: (feature: string) => boolean;
} => {
  return {
    getAuthSession: () => null,
    saveAuthSession: (authSession: AuthSession) => {},
    isLoggedIn: () => false,
    logout: () => null,
    stayLoggedIn: () => false,
    setStayLoggedIn: (b: boolean) => null,
    hasAccessToFeature: (feature: string): boolean => false,
  };
};

export const AuthenticationContext = createContext(
  getInitialAuthenticationContext(),
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
  function saveAuthSession(newSess: AuthSession): void {
    let sess: AuthSession | null = getAuthSession();
    if (sess == null) {
      sess = newSess;
    } else {
      sess.idToken = newSess.idToken || sess.idToken;
      sess.refreshToken = newSess.refreshToken || sess.refreshToken;
      sess.features = newSess.features || sess.features;
    }

    localStorage.setItem("authSession", JSON.stringify(sess));
  }

  const getAuthSession = (): AuthSession | null => {
    const savedAuthSession = localStorage.getItem("authSession");
    if (savedAuthSession == null) {
      return null;
    }

    const authSession: unknown = JSON.parse(savedAuthSession);
    if (!isAuthSession(authSession)) {
      logout();
      return null;
    }
    return authSession;
  };

  function isLoggedIn(): boolean {
    const authSession: AuthSession | null = getAuthSession();
    return authSession !== null && !idTokenIsExpired(authSession.idToken);
  }

  function logout(): void {
    localStorage.removeItem("authSession");
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

  function hasAccessToFeature(feature: string): boolean {
    const authSession: AuthSession | null = getAuthSession();
    if (authSession === null) {
      return false;
    }
    return authSession.features.includes(feature);
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
        hasAccessToFeature,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
