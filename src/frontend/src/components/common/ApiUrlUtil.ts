import { API_URLS } from "./constants";

export const getTimesheetApiUrlForEmployee = (getUpcoming: boolean) => {
  return `${API_URLS.TIMESHEET}?upcoming=${getUpcoming}`;
};

export const getAuthApiUrlForEmail = (email: string) => {
  return `${API_URLS.AUTH}/${email}`;
};
