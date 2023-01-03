export const API_CONSTANTS = {
  BASE_URL: "https://v9kuc5lqq2.execute-api.us-west-2.amazonaws.com/v1",
  TIMESHEET: "timesheet",
  AVAILABILITY: "availability",
  AUTH: "auth",
};

const PLEASE_CONTACT_JUSTIN =
  "Please contact Justin Lui (Manager) on Slack for support.";
export const ERROR_MESSAGSES = {
  UNKNOWN_ERROR: "An unknown error has occurred. " + PLEASE_CONTACT_JUSTIN,
  EMPLOYEE_NOT_FOUND: "Employee not found",
  SERVER_ERROR: "Server error. " + PLEASE_CONTACT_JUSTIN,
  UPDATE_DISABLED: "Updating availability is currently disabled",
  SIGNUP_ERROR:
    "An error has occurred while trying to sign you up. " +
    PLEASE_CONTACT_JUSTIN,
  NO_USER_TO_VERIFY_ERROR:
    "No user to verify. This is an error. " + PLEASE_CONTACT_JUSTIN,
};

export const SUCCESS_MESSAGES = {
  SUCCESSFUL_VERIFICATION:
    "Succesfully verified your account. You may now log in.",
};

export const INFO_MESSAGES = {
  VERIFICATION_CODE_SENT: "A verification code was sent to your email.",
};
