import { Alert } from "@mui/material";
import { createContext, useContext, useState } from "react";

export enum AlertType {
  SUCCESS = "success",
  ERROR = "error",
  INFO = "info",
  WARNING = "warning",
}

export interface AlertInfo {
  type: AlertType;
  message: string;
}

const AUTO_CLOSE_DELAY = 5000;

export const displayAlert = (
  alert: AlertInfo | null,
  close: () => void
): JSX.Element | null => {
  if (alert === null) {
    return null;
  }

  if (alert.type !== AlertType.ERROR) {
    setTimeout(() => {
      close();
    }, AUTO_CLOSE_DELAY);
  }

  return (
    <Alert
      severity={alert.type}
      className="absolute left-0 right-0 top-3 z-50 ml-auto mr-auto w-11/12 md:w-3/12"
      onClose={close}
    >
      {alert.message}
    </Alert>
  );
};

interface AlertContextProviderProps {
  children: React.ReactNode;
}

const getInitialAlertContext = () => {
  return {
    setAlert: (alert: AlertInfo | null) => {},
  };
};
const AlertContext = createContext(getInitialAlertContext());

export const AlertContextProvider = ({
  children,
}: AlertContextProviderProps) => {
  const [alert, setAlert] = useState<AlertInfo | null>(null);

  return (
    <AlertContext.Provider
      value={{
        setAlert,
      }}
    >
      {displayAlert(alert, () => setAlert(null))}
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = (): {
  setAlert: (alert: AlertInfo | null) => void;
} => {
  return useContext(AlertContext);
};
