import axios from "axios";
import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { getAuthApiUrlForEmail } from "../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../common/constants";
import { AuthenticationWidget } from "./AuthenticationWidget";

const AuthenticationDataProvider = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const getEmployeeIdFromEmail = async (): Promise<void> => {
    const response = await axios.get(getAuthApiUrlForEmail(email));

    switch (response.status) {
      case 200:
        if (typeof response.data !== "string") {
          return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
        }
        console.log(response.data);
        return Promise.resolve();
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGSES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
    }
  };

  const { refetch } = useQuery("email", getEmployeeIdFromEmail, {
    enabled: false,
    retry: 1,
  });

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

  return (
    <AuthenticationWidget
      email={email}
      password={password}
      handleChange={handleChange}
      refetch={refetch}
    />
  );
};

export const AuthenticationForm = () => {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthenticationDataProvider />
    </QueryClientProvider>
  );
};
