import { Box } from "@mui/material";
import { CognitoUser } from "amazon-cognito-identity-js";
import { AxiosError } from "axios";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { AlertInfo, AlertType } from "../common/Alerts";
import { ERROR_MESSAGSES, SUCCESS_MESSAGES } from "../common/constants";
import { signUp, verifySignup } from "./helpers/authentication";
import { LoginSignupWidget } from "./LoginSignupWidget";
import { VerifySignupWidget } from "./VerifySignupWidget";

const AuthenticationController = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertInfo | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifyingSignup, setIsVerifyingSignup] = useState(false);
  const [userToVerify, setUserToVerify] = useState<CognitoUser | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "verificationCode":
        setVerificationCode(value);
        break;
      default:
        break;
    }
  };

  const closeAlert = () => {
    setAlert(null);
  };

  const onSignup = async () => {
    setIsLoading(true);
    try {
      const unverifiedUser = await signUp(email, password);
      setUserToVerify(unverifiedUser.user);
      setIsVerifyingSignup(true);
    } catch (err) {
      if (!(err instanceof AxiosError || err instanceof Error)) {
        console.log(err);
      } else {
        const alert: AlertInfo = {
          type: AlertType.ERROR,
          message: err.message,
        };

        if (err instanceof AxiosError) {
          alert.message = err.response?.data;
        }
        setAlert(alert);
      }
    }
    setIsLoading(false);
  };

  const onVerifySignup = async () => {
    if (userToVerify == null) {
      setAlert({
        type: AlertType.ERROR,
        message: ERROR_MESSAGSES.NO_USER_TO_VERIFY_ERROR,
      });
      return;
    }

    setIsLoading(true);
    try {
      await verifySignup(userToVerify, verificationCode);
      setAlert({
        type: AlertType.SUCCESS,
        message: SUCCESS_MESSAGES.SUCCESSFUL_VERIFICATION,
      });
    } catch (err) {
      const errorAlert: AlertInfo = {
        type: AlertType.ERROR,
        message: ERROR_MESSAGSES.UNKNOWN_ERROR,
      };
      if (err instanceof Error) {
        errorAlert.message = err.message;
      }

      console.error(err);
      setAlert(errorAlert);
    }
    setIsLoading(false);
    setUserToVerify(null);
    setIsVerifyingSignup(false);
  };

  return (
    <Box className="border-grey-100 flex-inline m-1 max-w-md justify-center rounded-md border-2 p-4 align-middle">
      <img
        src="wun2free_logo.png"
        className="mx-auto my-auto mb-10 aspect-auto w-48"
      />
      {isVerifyingSignup ? (
        <VerifySignupWidget
          isLoading={isLoading}
          verificationCode={verificationCode}
          onVerifySignup={onVerifySignup}
          handleChange={handleChange}
          alert={alert}
          closeAlert={closeAlert}
        />
      ) : (
        <LoginSignupWidget
          email={email}
          password={password}
          isLoading={isLoading}
          alert={alert}
          handleChange={handleChange}
          onSignup={onSignup}
          closeAlert={closeAlert}
        />
      )}
    </Box>
  );
};

export const AuthenticationForm = () => {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthenticationController />
    </QueryClientProvider>
  );
};
