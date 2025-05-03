const BASE_URL = "https://q4q2yztd56.execute-api.us-west-2.amazonaws.com/v1";
export const API_URLS = {
  TIMESHEET: `${BASE_URL}/timesheet`,
  AVAILABILITY: `${BASE_URL}/availability`,
  AUTH: `${BASE_URL}/auth`,
  EMPLOYEE: `${BASE_URL}/auth/employee`,
  VERIFY: `${BASE_URL}/auth/verify`,
  LOGIN: `${BASE_URL}/auth/login`,
  PASSWORD: `${BASE_URL}/auth/password`,
  SCHEDULING: `${BASE_URL}/scheduling`,
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
  EMPLOYEE_NOT_CONFIRMED: "User is not confirmed.",
};

export const RESPONSE_ERROR_MESSAGE_MAP: {
  [key: string]: string;
} = {
  "employee not found": ERROR_MESSAGES.EMPLOYEE_NOT_FOUND,
};

export const SUCCESS_MESSAGES = {
  AVAILABILITY: {
    SUCESSFUL_UPDATE: "Your availability has been updated.",
  },
} as const;

export const ROUTES = {
  LOGIN: "/",
  SIGNUP: "/signUp",
  RESET_PASSWORD: "/resetPassword",
  DASHBOARD: "/dashboard",
} as const;

export const TOAST = {
  HEADERS: {
    SUCCESS: "Success!",
    INFO: "Info",
    ERROR: "Uh oh!",
  },
  DURATIONS: {
    SUCCESS: 2000,
    INFO: 3000,
    ERROR: 5000,
  },
  MESSAGES: {
    VERIFICATION_CODE_SENT: "A verification code was sent to your email.",
    SUCCESSFUL_PASSWORD_RESET:
      "Succesfully reset your password. You may now log in.",
    SUCCESSFUL_VERIFICATION:
      "Succesfully verified your account. You may now log in.",
  },
} as const;

const LOCAL_TIMEZONE: string = "America/Los_Angeles";

export function dateToFormatForUser(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: LOCAL_TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function dateToFormatForApi(date: Date): string {
  // Convert to PST timezone using native JS
  const pstDate = new Date(date.toLocaleString("en-US", { timeZone: LOCAL_TIMEZONE }));
  
  // Format the PST date to YYYY-MM-DD
  const year = pstDate.getFullYear();
  const month = String(pstDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(pstDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
