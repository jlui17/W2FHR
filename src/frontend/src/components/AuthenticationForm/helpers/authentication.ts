import axios from "axios";
import { getAuthApiUrlForEmail } from "../../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../../common/constants";

export const signUp = async (email: string, password: string) => {
  try {
    const employeeId = await getEmployeeIdFromEmail(email);
    console.log(employeeId);
  } catch (err) {
    console.log(err);
  }
  return Promise.resolve();
};

const getEmployeeIdFromEmail = async (email: string): Promise<string> => {
  const response = await axios.get(getAuthApiUrlForEmail(email));

  switch (response.status) {
    case 200:
      if (typeof response.data !== "string") {
        return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
      }
      return Promise.resolve(response.data);
    case 404:
      return Promise.reject(new Error(ERROR_MESSAGSES.EMPLOYEE_NOT_FOUND));
    default:
      return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
  }
};
