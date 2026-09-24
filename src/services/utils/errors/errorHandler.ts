import i18n from "../../../config/localization/i18n";


const t = (key: string) => i18n.t(key);

// ============================
// TYPES
// ============================
export interface ParsedError {
  message: string;
  code?: string;
  field?: string;
}

type ErrorContext =
  | "login"
  | "signup"
  | "otp"
  | "forgotPassword"
  | "resetPassword"
  | "addExpense"
  | "generic";

// ============================
// GENERIC / SERVER-LEVEL ERRORS
// (network, timeout, 500s, unknown — same across all screens)
// ============================
const getGenericError = (error: any): string | null => {
  // No internet / network unreachable
  if (
    error?.message === "Network Error" ||
    error?.code === "ERR_NETWORK" ||
    error?.message?.includes("NO_INTERNET")
  ) {
    return t("errors.noInternet");
  }

  // Request timeout
  if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
    return t("errors.timeout");
  }

  // No response from server at all
  if (!error?.response) {
    return t("errors.serverUnreachable");
  }

  const status = error.response.status;

  // Server crashed / internal error
  if (status >= 500) {
    return t("errors.serverError");
  }

  // Too many requests
  if (status === 429) {
    return t("errors.tooManyRequests");
  }

  // Unauthorized (session expired, handled globally by HttpProvider,
  // but kept here as a friendly fallback message)
  if (status === 401) {
    return t("errors.sessionExpired");
  }

  // Forbidden
  if (status === 403) {
    return t("errors.forbidden");
  }

  // Not found
  if (status === 404) {
    return t("errors.notFound");
  }

  return null; // let screen-specific handler take over
};

// ============================
// LOGIN ERRORS
// ============================
const parseLoginError = (error: any): string => {
  const generic = getGenericError(error);
  if (generic) return generic;

  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message?.toLowerCase() || "";

  if (status === 400 || status === 401) {
    if (backendMessage.includes("password")) return t("login.invalidCredentials");
    if (backendMessage.includes("not found") || backendMessage.includes("no user"))
      return t("login.accountNotFound");
    if (backendMessage.includes("not verified"))
      return t("login.accountNotVerified");
    if (backendMessage.includes("blocked") || backendMessage.includes("suspended"))
      return t("login.accountBlocked");
    return t("login.invalidCredentials");
  }

  return t("errors.somethingWentWrong");
};

// ============================
// SIGNUP ERRORS
// ============================
const parseSignUpError = (error: any): string => {
  const generic = getGenericError(error);
  if (generic) return generic;

  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message?.toLowerCase() || "";

  if (status === 409 || backendMessage.includes("already exists")) {
    if (backendMessage.includes("email")) return t("signup.emailAlreadyExists");
    if (backendMessage.includes("phone")) return t("signup.phoneAlreadyExists");
    return t("signup.accountAlreadyExists");
  }

  if (status === 400) {
    if (backendMessage.includes("email")) return t("signup.emailInvalid");
    if (backendMessage.includes("phone")) return t("signup.phoneInvalid");
    if (backendMessage.includes("password")) return t("signup.passwordWeak");
    return t("signup.invalidDetails");
  }

  return t("errors.somethingWentWrong");
};

// ============================
// OTP ERRORS
// ============================
const parseOtpError = (error: any): string => {
  const generic = getGenericError(error);
  if (generic) return generic;

  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message?.toLowerCase() || "";

  if (status === 400 || status === 401) {
    if (backendMessage.includes("expired")) return t("otp.otpExpired");
    if (backendMessage.includes("invalid") || backendMessage.includes("incorrect"))
      return t("otp.otpInvalid");
    if (backendMessage.includes("max") || backendMessage.includes("attempts"))
      return t("otp.otpMaxAttempts");
    return t("otp.otpInvalid");
  }

  if (status === 429) {
    return t("otp.otpTooManyRequests");
  }

  return t("errors.somethingWentWrong");
};

// ============================
// FORGOT PASSWORD ERRORS
// ============================
const parseForgotPasswordError = (error: any): string => {
  const generic = getGenericError(error);
  if (generic) return generic;

  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message?.toLowerCase() || "";

  if (status === 404 || backendMessage.includes("not found")) {
    return t("forgotPassword.accountNotFound");
  }

  if (status === 429) {
    return t("forgotPassword.tooManyAttempts");
  }

  return t("errors.somethingWentWrong");
};

// ============================
// RESET PASSWORD ERRORS
// ============================
const parseResetPasswordError = (error: any): string => {
  const generic = getGenericError(error);
  if (generic) return generic;

  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message?.toLowerCase() || "";

  if (status === 400 || status === 401) {
    if (backendMessage.includes("expired")) return t("resetPassword.linkExpired");
    if (backendMessage.includes("weak")) return t("resetPassword.passwordWeak");
    if (backendMessage.includes("same")) return t("resetPassword.samePassword");
    return t("resetPassword.invalidRequest");
  }

  return t("errors.somethingWentWrong");
};

// ============================
// ADD EXPENSE ERRORS
// ============================
const parseAddExpenseError = (error: any): string => {
  const generic = getGenericError(error);
  if (generic) return generic;

  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message?.toLowerCase() || "";

  if (status === 400) {
    if (backendMessage.includes("amount")) return t("addExpense.amountInvalid");
    if (backendMessage.includes("categor")) return t("addExpense.categoryRequired");
    if (backendMessage.includes("date")) return t("addExpense.dateRequired");
    return t("addExpense.invalidDetails");
  }

  return t("errors.somethingWentWrong");
};

// ============================
// MASTER PARSER
// ============================
export const parseApiError = (
  error: any,
  context: ErrorContext = "generic",
): string => {
  try {
    switch (context) {
      case "login":
        return parseLoginError(error);
      case "signup":
        return parseSignUpError(error);
      case "otp":
        return parseOtpError(error);
      case "forgotPassword":
        return parseForgotPasswordError(error);
      case "resetPassword":
        return parseResetPasswordError(error);
      case "addExpense":
        return parseAddExpenseError(error);
      default:
        return getGenericError(error) || t("errors.somethingWentWrong");
    }
  } catch (e) {
    // Fallback — parsing itself failed, never expose raw error to user
    return t("errors.somethingWentWrong");
  }
};