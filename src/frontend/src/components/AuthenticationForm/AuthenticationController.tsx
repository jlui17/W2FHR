import { AxiosError } from "axios";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { AlertInfo, AlertType } from "../common/Alerts";
import { signUp } from "./helpers/authentication";
import { LoginSignupWidget } from "./LoginSignupWidget";

const AuthenticationController = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertInfo | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const closeAlert = () => {
    setAlert(null);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      await signUp(email, password);
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

  return (
    <LoginSignupWidget
      email={email}
      password={password}
      isLoading={isLoading}
      alert={alert}
      handleChange={handleChange}
      onSignup={onSubmit}
      closeAlert={closeAlert}
    />
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
