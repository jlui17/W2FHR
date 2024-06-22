import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useContext } from "react";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { AlertInfo, AlertType, useAlert } from "../common/Alerts";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../common/constants";
import { AvailabilityForm } from "./AvailabilityForm";
import {
  UserAvailability,
  useUpdateAvailability,
  useUserAvailability,
} from "./helpers/hooks";

const defaultAvailability: UserAvailability = {
  canUpdate: false,
  day1: { isAvailable: false, date: "" },
  day2: { isAvailable: false, date: "" },
  day3: { isAvailable: false, date: "" },
  day4: { isAvailable: false, date: "" },
};

function AvailabilityDataProvider(): JSX.Element {
  const { setAlert } = useAlert();
  const { getAuthSession } = useContext(AuthenticationContext);

  const { isPending, isError, data, error } = useUserAvailability({
    idToken: getAuthSession()?.IdToken || "",
  });

  const { mutate: updateAvailability, isPending: updateIsPending } =
    useUpdateAvailability({
      onSuccess: () => {
        setAlert({
          type: AlertType.SUCCESS,
          message: SUCCESS_MESSAGES.AVAILABILITY.SUCESSFUL_UPDATE,
        });
      },
      onError: (error) => {
        console.error(`Error in Availability:\n${error}`);
        const errorAlert: AlertInfo = {
          type: AlertType.ERROR,
          message: ERROR_MESSAGES.UNKNOWN_ERROR,
        };
        if (error instanceof Error) {
          errorAlert.message = error.message;
        }
        setAlert(errorAlert);
      },
    });

  function getFormData() {
    const res: string[] = [];

    if (!isPending && data !== undefined) {
      if (data.day1.isAvailable) res.push("day1");
      if (data.day2.isAvailable) res.push("day2");
      if (data.day3.isAvailable) res.push("day3");
      if (data.day4.isAvailable) res.push("day4");
    }

    return res;
  }

  if (isError) {
    console.error(`Error in Availability:\n${error}`);
    const errorAlert: AlertInfo = {
      type: AlertType.ERROR,
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
    };
    if (error instanceof Error) {
      errorAlert.message = error.message;
    }
    setAlert(errorAlert);
  }

  return (
    <AvailabilityForm
      isLoading={isPending || updateIsPending}
      availability={data || defaultAvailability}
      formData={getFormData()}
    />
  );
}

export const Availability = (): JSX.Element => {
  const { setAlert } = useAlert();

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        console.error(`Error in Availability:\n${error}`);
        const errorAlert: AlertInfo = {
          type: AlertType.ERROR,
          message: ERROR_MESSAGES.UNKNOWN_ERROR,
        };
        if (error instanceof Error) {
          errorAlert.message = error.message;
        }
        setAlert(errorAlert);
      },
    }),
  });
  return (
    <QueryClientProvider client={queryClient}>
      <AvailabilityDataProvider />
    </QueryClientProvider>
  );
};
