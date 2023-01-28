import { API_URLS } from "./constants";

export const getTimesheetApiUrlForEmployee = (
  employeeId: string,
  getUpcoming: boolean
) => {
  return `${API_URLS.BASE_URL}/${API_URLS.TIMESHEET}/${employeeId}?upcoming=${getUpcoming}`;
};

export const getAuthApiUrlForEmail = (email: string) => {
  return `${API_URLS.BASE_URL}/${API_URLS.AUTH}/${email}`;
};
