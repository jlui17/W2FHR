import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthenticationWidget } from "./AuthenticationWidget";
import { signUp } from "./helpers/authentication";

const AuthenticationDataProvider = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async () => {
    setIsLoading(true);
    await signUp(email, password);
    setIsLoading(false);
  };

  return (
    <AuthenticationWidget
      email={email}
      password={password}
      isLoading={isLoading}
      handleChange={handleChange}
      onSubmit={onSubmit}
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
