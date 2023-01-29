import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthenticationContext } from "../../../AuthenticationContextProvider";
import { ROUTES } from "../../../common/constants";
import { HeaderWidget } from "./HeaderWidget";

const HeaderController = () => {
  const { logout } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return <HeaderWidget onLogout={onLogout} />;
};

export const Header = () => <HeaderController />;
