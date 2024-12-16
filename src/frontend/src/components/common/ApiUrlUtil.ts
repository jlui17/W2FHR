import { API_URLS } from "./constants";

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
  return `${API_URLS.TIMESHEET}?start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`;
}