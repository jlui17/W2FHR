import { API_CONSTANTS } from "./constants";

export const getTimesheetApiUrlForEmployee = (employeeId: string) => {
  return `${API_CONSTANTS.BASE_URL}/${API_CONSTANTS.TIMESHEET}/${employeeId}`;
};

export const getAvailabilityApiUrlForEmployee = (employeeId: string) => {
  return `${API_CONSTANTS.BASE_URL}/${API_CONSTANTS.AVAILABILITY}/${employeeId}`;
};
