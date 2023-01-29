import { useContext } from "react";
import { AuthenticationContext } from "../../../AuthenticationContextProvider";
import { HeaderWidget } from "./HeaderWidget";

const HeaderController = () => {
  const { logout } = useContext(AuthenticationContext);

  const onLogout = () => {
    logout();
    window.location.reload();
  };

  return <HeaderWidget onLogout={onLogout} />;
};

export const Header = () => <HeaderController />;
