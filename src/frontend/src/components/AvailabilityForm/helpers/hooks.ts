import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { API_URLS, ERROR_MESSAGES } from "../../common/constants";

export const AVAIALBILITY_QUERY_KEY = ["availability"] as const;

export interface Day {
  isAvailable: boolean;
  date: string;
}
function isDay(data: unknown): data is Day {
  return data instanceof Object && "date" in data && "isAvailable" in data;
}
export interface UserAvailability {
  day1: Day;
  day2: Day;
  day3: Day;
  day4: Day;
  canUpdate: boolean;
}
function isAvailabilityData(data: unknown): data is UserAvailability {
  return (
    data instanceof Object &&
    "day1" in data &&
    isDay(data.day1) &&
    "day2" in data &&
    isDay(data.day2) &&
    "day3" in data &&
    isDay(data.day3) &&
    "day4" in data &&
    isDay(data.day4) &&
    "canUpdate" in data
  );
}

export function useUserAvailability(p: {
  idToken: string;
}): UseQueryResult<UserAvailability, Error> {
  async function fetchAvailability(): Promise<UserAvailability> {
    const response = await fetch(API_URLS.AVAILABILITY, {
      headers: {
        Authorization: `Bearer ${p.idToken}`,
      },
      mode: "cors",
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        if (!isAvailabilityData(data)) {
          return Promise.reject(
            new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT),
          );
        }
        return Promise.resolve(data);
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
    }
  }

  return useQuery({
    queryKey: AVAIALBILITY_QUERY_KEY,
    queryFn: fetchAvailability,
  });
}

interface UpdateAvailabilityParams {
  availabilityData: UserAvailability;
  idToken: string;
}
export function useUpdateAvailability(p: {
  onSuccess: (data: UserAvailability) => void;
  onError: (err: Error) => void;
}): UseMutationResult<
  UserAvailability,
  Error,
  UpdateAvailabilityParams,
  unknown
> {
  async function updateAvailability(
    p: UpdateAvailabilityParams,
  ): Promise<UserAvailability> {
    const response = await fetch(API_URLS.AVAILABILITY, {
      headers: {
        Authorization: `Bearer ${p.idToken}`,
      },
      method: "POST",
      mode: "cors",
      body: JSON.stringify(p.availabilityData),
    });

    switch (response.status) {
      case 200:
        const data: unknown = await response.json();
        if (!isAvailabilityData(data)) {
          return Promise.reject(
            new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT),
          );
        }
        return Promise.resolve(data);
      case 403:
        return Promise.reject(new Error(ERROR_MESSAGES.UPDATE_DISABLED));
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
    }
  }

  return useMutation({
    mutationFn: (v: UpdateAvailabilityParams) => updateAvailability(v),
    onSuccess: p.onSuccess,
    onError: p.onError,
  });
}
