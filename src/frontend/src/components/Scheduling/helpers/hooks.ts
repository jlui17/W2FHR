import { getSchedulingApiUrl } from "@/components/common/ApiUrlUtil";
import { API_URLS, dateToFormatForUser, ERROR_MESSAGES } from "@/components/common/constants";
import { DefinedUseQueryResult, useMutation, UseMutationResult, useQuery } from "@tanstack/react-query";

function isSchedulingMetadata(data: unknown): data is SchedulingMetadataFromAPI {
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
    data.breakDurations.every((breakDuration) => typeof breakDuration === "string")
  );
}

export function isSchedulingDataFromAPI(data: unknown): data is SchedulingDataFromAPI {
  if (
    data === null ||
    typeof data !== "object" ||
    !("availability" in data) ||
    !("scheduledEmployees" in data) ||
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

  const availability = (data as SchedulingDataFromAPI).availability;
  if (typeof availability !== "object") {
    return false;
  }

  const scheduledEmployees = (data as SchedulingDataFromAPI).scheduledEmployees;
  if (typeof scheduledEmployees !== "object") {
    return false;
  }

  // Check availability structure
  const availabilityValid = Object.entries(availability).every(([key, value]) => {
    return (
      typeof key === "string" &&
      (value === null || (Array.isArray(value) && value.every((item) => isAvailableEmployeeType(item))))
    );
  });

  // Check scheduledEmployees structure
  const scheduledEmployeesValid = Object.entries(scheduledEmployees).every(([key, value]) => {
    return (
      typeof key === "string" &&
      (value === null || (Array.isArray(value) && value.every((item) => isScheduledEmployeeType(item))))
    );
  });

  return availabilityValid && scheduledEmployeesValid;
}

function isAvailableEmployeeType(data: unknown): data is AvailableEmployee {
  return (
    data !== null &&
    typeof data === "object" &&
    "name" in data &&
    typeof data.name === "string" &&
    "position" in data &&
    typeof data.position === "string"
  );
}

interface SchedulingMetadataFromAPI {
  shiftTitles: string[];
  shiftTimes: string[];
  breakDurations: string[];
}

export interface AvailableEmployee {
  name: string;
  position: string;
}

interface ScheduledEmployee {
  name: string;
}

function isScheduledEmployeeType(data: unknown): data is ScheduledEmployee {
  return (
    data !== null &&
    typeof data === "object" &&
    "name" in data &&
    typeof data.name === "string"
  );
}

interface SchedulingDataFromAPI {
  availability: { [key: string]: AvailableEmployee[] };
  scheduledEmployees: { [key: string]: ScheduledEmployee[] };
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
  availability: { [key: string]: AvailableEmployee[] };
  scheduledEmployees: { [key: string]: Set<ScheduledEmployee> };
  metadata: SchedulingMetadata;
  showMonday: boolean;
  disableUpdates: boolean;
  startOfWeek: Date;
  days: string[];
}

export function convertSchedulingDataFromAPI(data: SchedulingDataFromAPI): SchedulingData {
  // we want to standardize the format of the strings to avoid indexing issues
  const availability: { [key: string]: AvailableEmployee[] } = {};
  for (const [date, employees] of Object.entries(data.availability)) {
    availability[dateToFormatForUser(new Date(date))] = employees;
  }

  // Convert scheduledEmployees arrays to Sets
  const scheduledEmployees: { [key: string]: Set<ScheduledEmployee> } = {};
  for (const [date, employees] of Object.entries(data.scheduledEmployees)) {
    scheduledEmployees[dateToFormatForUser(new Date(date))] = new Set(employees);
  }

  const days: string[] = Object.keys(data.availability)
    .map((day: string): Date => new Date(day))
    .sort((a: Date, b: Date) => a.getTime() - b.getTime())
    .map((date: Date): string => dateToFormatForUser(date));

  return {
    availability: availability,
    scheduledEmployees: scheduledEmployees,
    metadata: {
      shiftTitles: new Set(data.metadata.shiftTitles),
      shiftTimes: data.metadata.shiftTimes,
      breakDurations: data.metadata.breakDurations,
    },
    showMonday: data.showMonday,
    disableUpdates: data.disableUpdates,
    startOfWeek: new Date(data.startOfWeek),
    days: days,
  };
}

export const SCHEDULING_DATA_QUERY_KEY: string[] = ["scheduling"];

export function useSchedulingData(p: { idToken: string }): DefinedUseQueryResult<SchedulingData, Error> {
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
          console.error("Inconsistent data from useSchedulingData hook: ", data);
          return Promise.reject(new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT));
        }
        return Promise.resolve(convertSchedulingDataFromAPI(data));
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
    }
  }

  return useQuery({
    queryKey: SCHEDULING_DATA_QUERY_KEY,
    queryFn: getSchedulingData,
    initialData: {
      availability: {},
      scheduledEmployees: {},
      metadata: {
        shiftTitles: new Set<string>(),
        shiftTimes: [],
        breakDurations: [],
      },
      showMonday: false,
      disableUpdates: false,
      startOfWeek: new Date(),
      days: [],
    },
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
  async function updateSchedulingData(p: UpdateSchedulingRequest): Promise<SchedulingData> {
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
          return Promise.reject(new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT));
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
