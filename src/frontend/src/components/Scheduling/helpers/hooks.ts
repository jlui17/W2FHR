import { getSchedulingApiUrl } from "@/components/common/ApiUrlUtil";
import { API_URLS, ERROR_MESSAGES } from "@/components/common/constants";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";

interface ScheduleMetadata {
  shiftTitles: Set<string>;
  shiftTimes: string[];
  breakDurations: string[];
}

function isScheduleMetadata(data: unknown): data is ScheduleMetadata {
  if (
    !(
      data !== null &&
      typeof data === "object" &&
      "shiftTitles" in data &&
      "shiftTimes" in data &&
      "breakDurations" in data
    )
  ) {
    return false;
  }
  if (
    !(
      Array.isArray(data.shiftTitles) &&
      Array.isArray(data.shiftTimes) &&
      Array.isArray(data.breakDurations) &&
      data.shiftTitles.every((shiftTitle) => typeof shiftTitle === "string") &&
      data.shiftTimes.every((shiftTime) => typeof shiftTime === "string") &&
      data.breakDurations.every(
        (breakDuration) => typeof breakDuration === "string",
      )
    )
  ) {
    return false;
  }

  data.shiftTitles = new Set<string>(data.shiftTitles);
  return true;
}

export function isSchedulingData(data: unknown): data is SchedulingData {
  if (
    data === null ||
    typeof data !== "object" ||
    !("availability" in data) ||
    !("metadata" in data) ||
    !isScheduleMetadata(data.metadata) ||
    !("showMonday" in data) ||
    typeof data.showMonday !== "boolean" ||
    !("disableUpdates" in data) ||
    typeof data.disableUpdates !== "boolean" ||
    !("startOfWeek" in data) ||
    typeof data.startOfWeek !== "string"
  ) {
    return false;
  }
  data.startOfWeek = new Date(data.startOfWeek);

  const availability = (data as SchedulingData).availability;
  if (typeof availability !== "object") {
    return false;
  }

  return Object.entries(availability).every(([key, value]) => {
    return (
      typeof key === "string" &&
      Array.isArray(value) &&
      value.every((item) => typeof item === "string")
    );
  });
}

export interface SchedulingData {
  availability: { [key: string]: string[] };
  metadata: ScheduleMetadata;
  showMonday: boolean;
  disableUpdates: boolean;
  startOfWeek: Date;
}

export function useSchedulingData(p: {
  idToken: string;
  queryKey: string[];
}): UseQueryResult<SchedulingData, Error> {
  async function getSchedulingData(): Promise<SchedulingData> {
    const response = await fetch(getSchedulingApiUrl(), {
      headers: {
        Authorization: `Bearer ${p.idToken}`,
      },
      mode: "cors",
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        if (!isSchedulingData(data)) {
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
    queryKey: p.queryKey,
    queryFn: getSchedulingData,
    refetchOnMount: false,
  });
}

export interface UpdateSchedulingRequest {
  idToken: string;
  updates: {
    showMonday?: boolean;
    disableUpdates?: boolean;
    startOfWeek?: string; // Jan 04, 2024 == 2024-01-04
  };
}

export function useUpdateSchedulingData(p: {
  onSuccess: (data: SchedulingData) => void;
  onError: (err: Error) => void;
}): UseMutationResult<SchedulingData, Error, UpdateSchedulingRequest, unknown> {
  async function updateSchedulingData(
    p: UpdateSchedulingRequest,
  ): Promise<SchedulingData> {
    const response = await fetch(API_URLS.SCHEDULING, {
      headers: {
        Authorization: `Bearer ${p.idToken}`,
      },
      method: "PUT",
      mode: "cors",
      body: JSON.stringify(p.updates),
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        if (!isSchedulingData(data)) {
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
    mutationFn: (v: UpdateSchedulingRequest) => updateSchedulingData(v),
    onSuccess: p.onSuccess,
    onError: p.onError,
  });
}
