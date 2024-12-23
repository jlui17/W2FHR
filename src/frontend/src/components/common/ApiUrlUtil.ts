import { API_URLS, dateToFormatForApi } from "./constants";

export function getTimesheetApiUrlForEmployee(getUpcoming: boolean): string {
  return `${API_URLS.TIMESHEET}?upcoming=${getUpcoming}`;
};

export const getAuthApiUrlForEmail = (email: string) => {
  return `${API_URLS.AUTH}/${email}`;
};


export const getAuthApiUrlForResetPassword = (email: string) => {
  return `${API_URLS.AUTH}/password?email=${email}`;
};

export function getScheduleForTimeRangeApiUrl(start: Date, end: Date): string {
  return `${API_URLS.TIMESHEET}?start=${dateToFormatForApi(start)}&end=${dateToFormatForApi(end)}`;
}

export function getSchedulingApiUrl(): string {
  return `${API_URLS.SCHEDULING}`;
}