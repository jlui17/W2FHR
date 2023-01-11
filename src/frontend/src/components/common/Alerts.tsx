import { Alert } from "@mui/material";

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
      className="absolute left-0 right-0 top-3 ml-auto mr-auto w-3/12"
      onClose={close}
    >
      {alert.message}
    </Alert>
  );
};
