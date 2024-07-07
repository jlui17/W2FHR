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

function AvailabilityController(): JSX.Element {
  const { setAlert } = useAlert();
  const { getAuthSession } = useContext(AuthenticationContext);

  const { refetch, isFetching, isError, data, error } = useUserAvailability({
    idToken: getAuthSession()?.IdToken || "",
  });

  const { mutate: updateAvailability, isPending: updateIsPending } =
    useUpdateAvailability({
      onSuccess: async () => {
        await refetch();
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

  function doUpdate(days: string[] | undefined): void {
    const newAvailability: UserAvailability = {
      day1: {
        isAvailable: days?.includes("day1") || false,
        date: "",
      },
      day2: {
        isAvailable: days?.includes("day2") || false,
        date: "",
      },
      day3: {
        isAvailable: days?.includes("day3") || false,
        date: "",
      },
      day4: {
        isAvailable: days?.includes("day4") || false,
        date: "",
      },
      canUpdate: true,
    };

    updateAvailability({
      availabilityData: newAvailability,
      idToken: getAuthSession()?.IdToken || "",
    });
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
      isLoading={isFetching || updateIsPending}
      availability={data || defaultAvailability}
      updateAvailability={doUpdate}
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
      <AvailabilityController />
    </QueryClientProvider>
  );
};
