import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useContext } from "react";
import { toast } from "sonner";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { ERROR_MESSAGES, TOAST } from "../common/constants";
import { AvailabilityForm, LoadingAvailabilityForm } from "./AvailabilityForm";
import {
  AVAIALBILITY_QUERY_KEY,
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

const queryClient = new QueryClient();

function AvailabilityController(): JSX.Element {
  const { getAuthSession } = useContext(AuthenticationContext);

  const { isFetching, isError, data, error } = useUserAvailability({
    idToken: getAuthSession()?.IdToken || "",
  });

  const { mutate: updateAvailability, isPending: updateIsPending } =
    useUpdateAvailability({
      onSuccess: async (updated: UserAvailability) => {
        queryClient.setQueryData(AVAIALBILITY_QUERY_KEY, () => updated);
        toast.success(TOAST.HEADERS.SUCCESS, {
          description: "Your availability has been updated.",
          duration: TOAST.DURATIONS.SUCCESS,
        });
      },
      onError: (error: Error) => {
        console.error(`Error in Availability:\n${error}`);
        let message: string = ERROR_MESSAGES.UNKNOWN_ERROR;
        if (error instanceof Error) {
          message = error.message;
        }
        toast.error(TOAST.HEADERS.ERROR, {
          description: message,
          duration: TOAST.DURATIONS.ERROR,
        });
      },
    });

  function doUpdate(days: string[] | undefined): void {
    // shouldn never happen, (update is disabled and data is only undefined) when loading or error
    if (data === undefined) {
      toast.error(TOAST.HEADERS.ERROR, {
        description:
          "The impossible happened. Please refresh the page or contact Justin Lui on Slack after a few tries.",
        duration: TOAST.DURATIONS.ERROR,
      });
      return;
    }

    const newAvailability: UserAvailability = {
      day1: {
        isAvailable: days?.includes("day1") || false,
        date: data.day1.date,
      },
      day2: {
        isAvailable: days?.includes("day2") || false,
        date: data.day2.date,
      },
      day3: {
        isAvailable: days?.includes("day3") || false,
        date: data.day3.date,
      },
      day4: {
        isAvailable: days?.includes("day4") || false,
        date: data.day4.date,
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
    toast.error(TOAST.HEADERS.ERROR, {
      description: error.message,
      duration: TOAST.DURATIONS.ERROR,
    });
  }

  if (isFetching || updateIsPending) {
    return <LoadingAvailabilityForm />;
  }

  return (
    <AvailabilityForm
      updateIsPending={updateIsPending}
      availability={data || defaultAvailability}
      updateAvailability={doUpdate}
    />
  );
}

export const Availability = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <AvailabilityController />
    </QueryClientProvider>
  );
};
