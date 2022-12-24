import { API_CONSTANTS } from "./constants";

export const getTimesheetApiUrlForEmployee = (
  employeeId: string,
  getUpcoming: boolean
) => {
  return `${API_CONSTANTS.BASE_URL}/${API_CONSTANTS.TIMESHEET}/${employeeId}?upcoming=${getUpcoming}`;
};

export const getAvailabilityApiUrlForEmployee = (employeeId: string) => {
  return `${API_CONSTANTS.BASE_URL}/${API_CONSTANTS.AVAILABILITY}/${employeeId}`;
};

export const getAuthApiUrlForEmail = (email: string) => {
  return `${API_CONSTANTS.BASE_URL}/${API_CONSTANTS.AUTH}/${email}`;
};
