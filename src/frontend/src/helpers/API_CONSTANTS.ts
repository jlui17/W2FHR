export const BASE_API_ENDPOINT =
  "https://v9kuc5lqq2.execute-api.us-west-2.amazonaws.com/v1";

interface AvailabilityDay {
  isAvailable: boolean;
  date: string;
}

export interface Availability {
  day1: AvailabilityDay;
  day2: AvailabilityDay;
  day3: AvailabilityDay;
  day4: AvailabilityDay;
  canUpdate: boolean;
}

export interface Timesheet {
  shifts: EmployeeShift[];
  viewingDates: string[];
}

interface EmployeeShift {
  date: string;
  shiftTitle: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
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
