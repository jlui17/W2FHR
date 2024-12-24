import { getSchedulingApiUrl } from "@/components/common/ApiUrlUtil";
import { API_URLS, ERROR_MESSAGES } from "@/components/common/constants";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";

function isSchedulingMetadata(
  data: unknown,
): data is SchedulingMetadataFromAPI {
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
  return (
    Array.isArray(data.shiftTitles) &&
    Array.isArray(data.shiftTimes) &&
    Array.isArray(data.breakDurations) &&
    data.shiftTitles.every((shiftTitle) => typeof shiftTitle === "string") &&
    data.shiftTimes.every((shiftTime) => typeof shiftTime === "string") &&
    data.breakDurations.every(
      (breakDuration) => typeof breakDuration === "string",
    )
  );
}

export function isSchedulingDataFromAPI(
  data: unknown,
): data is SchedulingDataFromAPI {
  if (
    data === null ||
    typeof data !== "object" ||
    !("availability" in data) ||
    !("metadata" in data) ||
    !isSchedulingMetadata(data.metadata) ||
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

interface SchedulingMetadataFromAPI {
  shiftTitles: string[];
  shiftTimes: string[];
  breakDurations: string[];
}

interface SchedulingDataFromAPI {
  availability: { [key: string]: string[] };
  metadata: SchedulingMetadataFromAPI;
  showMonday: boolean;
  disableUpdates: boolean;
  startOfWeek: string;
}

interface SchedulingMetadata {
  shiftTitles: Set<string>;
  shiftTimes: string[];
  breakDurations: string[];
}

export interface SchedulingData {
  availability: { [key: string]: string[] };
  metadata: SchedulingMetadata;
  showMonday: boolean;
  disableUpdates: boolean;
  startOfWeek: Date;
}

export function convertSchedulingDataFromAPI(
  data: SchedulingDataFromAPI,
): SchedulingData {
  const availabilitySets: { [key: string]: Set<string> } = {};
  Object.entries(data.availability).forEach(([key, value]) => {
    availabilitySets[key] = new Set(value);
  });
  return {
    availability: data.availability,
    metadata: {
      shiftTitles: new Set(data.metadata.shiftTitles),
      shiftTimes: data.metadata.shiftTimes,
      breakDurations: data.metadata.breakDurations,
    },
    showMonday: data.showMonday,
    disableUpdates: data.disableUpdates,
    startOfWeek: new Date(data.startOfWeek),
  };
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
        if (!isSchedulingDataFromAPI(data)) {
          return Promise.reject(
            new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT),
          );
        }
        return Promise.resolve(convertSchedulingDataFromAPI(data));
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
        if (!isSchedulingDataFromAPI(data)) {
          return Promise.reject(
            new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT),
          );
        }
        return Promise.resolve(convertSchedulingDataFromAPI(data));
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
