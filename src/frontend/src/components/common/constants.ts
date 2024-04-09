const BASE_URL = "https://q4q2yztd56.execute-api.us-west-2.amazonaws.com/v1";
export const API_URLS = {
  TIMESHEET: `${BASE_URL}/timesheet`,
  AVAILABILITY: `${BASE_URL}/availability`,
  AUTH: `${BASE_URL}/auth`,
  EMPLOYEE: `${BASE_URL}/auth/employee`,
  VERIFY: `${BASE_URL}/auth/verify`,
  LOGIN: `${BASE_URL}/auth/login`,

};

const PLEASE_CONTACT_JUSTIN =
  "Please contact Justin Lui (Manager) on Slack for support.";
export const ERROR_MESSAGES = {
  UNKNOWN_ERROR: "An unknown error has occurred. " + PLEASE_CONTACT_JUSTIN,
  EMPLOYEE_NOT_FOUND:
    "Email not found. Make sure you're using the same email provided during on-boarding. If the problem persists, please contact a manager.",
  SERVER: {
    GENERAL_ERROR: "Server error. " + PLEASE_CONTACT_JUSTIN,
    DATA_INCONSISTENT: `A server error has occurred (DATA INCONSISTENT). ${PLEASE_CONTACT_JUSTIN}`,
  },
  UPDATE_DISABLED: "Updating availability is currently disabled",
  SIGNUP_ERROR:
    "An error has occurred while trying to sign you up. " +
    PLEASE_CONTACT_JUSTIN,
  NO_USER_TO_VERIFY_ERROR:
    "No user to verify. This is an error. " + PLEASE_CONTACT_JUSTIN,
  AUTH: {
    NOT_SIGNED_IN: "You are not signed in.",
  },
};

export const RESPONSE_ERROR_MESSAGE_MAP: {
  [key: string]: string;
} = {
  "employee not found": ERROR_MESSAGES.EMPLOYEE_NOT_FOUND,
};

export const SUCCESS_MESSAGES = {
  SUCCESSFUL_VERIFICATION:
    "Succesfully verified your account. You may now log in.",
  SUCCESSFUL_PASSWORD_RESET:
    "Succesfully reset your password. You may now log in.",
  AVAILABILITY: {
    SUCESSFUL_UPDATE: "Your availability has been updated.",
  },
};

export const INFO_MESSAGES = {
  VERIFICATION_CODE_SENT: "A verification code was sent to your email.",
};

export const ROUTES = {
  LOGIN: "/",
  RESET_PASSWORD: "/resetPassword",
  DASHBOARD: "/dashboard",
};
