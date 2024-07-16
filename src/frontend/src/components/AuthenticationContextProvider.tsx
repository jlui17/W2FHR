import { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { jwtDecode } from "jwt-decode";
import { createContext, ReactNode } from "react";

interface AuthenticationContextProviderProps {
  children: ReactNode;
}

const getInitialAuthenticationContext = (): {
  getAuthSession: () => AuthenticationResultType | null;
  saveAuthSession: (authSession: AuthenticationResultType) => void;
  isLoggedIn: () => boolean;
  isManager: () => boolean;
  logout: () => void;
  stayLoggedIn: () => boolean;
  setStayLoggedIn: (b: boolean) => void;
} => {
  return {
    getAuthSession: () => null,
    saveAuthSession: (authSession: AuthenticationResultType) => {},
    isLoggedIn: () => false,
    isManager: () => false,
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
  'cognito:groups'?: string[];

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



  function saveAuthSession(newSess: AuthenticationResultType): void {
    let sess: AuthenticationResultType | null = getAuthSession();
    if (sess == null) {
      sess = newSess;
    } else {
      sess.AccessToken = newSess.AccessToken || sess.AccessToken;
      sess.IdToken = newSess.IdToken || sess.IdToken;
      sess.ExpiresIn = newSess.ExpiresIn || sess.ExpiresIn;
      sess.RefreshToken = newSess.RefreshToken || sess.RefreshToken;
      sess.NewDeviceMetadata =
        newSess.NewDeviceMetadata || sess.NewDeviceMetadata;
    }

    localStorage.setItem("authSession", JSON.stringify(sess));
  }

  const getAuthSession = () => {
    const savedAuthSession = localStorage.getItem("authSession");
    if (savedAuthSession != null) {
      const authSession: AuthenticationResultType =
        JSON.parse(savedAuthSession);
      return authSession;
    }
    return null;
  };

  function isLoggedIn(): boolean {
    const authSession: AuthenticationResultType | null = getAuthSession();
    return authSession !== null && !idTokenIsExpired(authSession.IdToken);
  }

  const isManager = (): boolean => {
    const session = getAuthSession();
    if (!session || !session.IdToken) return false;
    try {
      const decoded: IdToken = jwtDecode(session.IdToken);
      return decoded['cognito:groups']?.includes('managers') ?? false;
    } catch {
      return false;
    }
  };

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

  return (
    <AuthenticationContext.Provider
      value={{
        getAuthSession,
        saveAuthSession,
        isLoggedIn,
        isManager,
        logout,
        stayLoggedIn,
        setStayLoggedIn,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
