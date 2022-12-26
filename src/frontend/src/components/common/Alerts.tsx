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

export const displayAlert = (
  alert: AlertInfo | null,
  close: () => void
): JSX.Element | null => {
  if (alert === null) {
    return null;
  }

  return (
    <Alert
      severity={alert.type}
      style={{
        position: "absolute",
        left: "0",
        right: "0",
        width: "30%",
        marginLeft: "auto",
        marginRight: "auto",
        top: "10",
      }}
      onClose={close}
    >
      {alert.message}
    </Alert>
  );
};
