export const BASE_API_ENDPOINT =
  "https://v9kuc5lqq2.execute-api.us-west-2.amazonaws.com/v1";

interface AvailabilityDay {
  isAvailable: boolean;
  date: string;
}

export interface Availability {
  Day1: AvailabilityDay;
  Day2: AvailabilityDay;
  Day3: AvailabilityDay;
  Day4: AvailabilityDay;
}

export const QUERY_CLIENT_DEFAULT_OPTIONS = {
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 60 * 24,
    },
  },
};
