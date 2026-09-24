import i18n from "../../config/localization/i18n";

const t = (key: string) => i18n.t(key);

export const SignUpValidationErrors = {
  firstNameRequired: () => t("signup.firstNameRequired"),
  firstNameInvalid: () => t("signup.firstNameInvalid"),
  lastNameRequired: () => t("signup.lastNameRequired"),
  lastNameInvalid: () => t("signup.lastNameInvalid"),
  emailRequired: () => t("signup.emailRequired"),
  emailInvalid: () => t("signup.emailInvalid"),
  phoneRequired: () => t("signup.phoneRequired"),
  phoneInvalid: () => t("signup.phoneInvalid"),
  passwordRequired: () => t("signup.passwordRequired"),
  passwordMinLength: () => t("signup.passwordMinLength"),
  passwordWeak: () => t("signup.passwordWeak"),
  confirmPasswordRequired: () => t("signup.confirmPasswordRequired"),
  passwordsDoNotMatch: () => t("signup.passwordsDoNotMatch"),
};

export const LoginValidationErrors = {
  emailRequired: () => t("login.emailRequired"),
  emailInvalid: () => t("login.emailInvalid"),
  passwordRequired: () => t("login.passwordRequired"),
  passwordMinLength: () => t("login.passwordMinLength"),
  invalidCredentials: () => t("login.invalidCredentials"),
};

export const ForgotPasswordValidationErrors = {
  emailRequired: () => t("forgotPassword.emailRequired"),
  emailInvalid: () => t("forgotPassword.emailInvalid"),
};

export const OtpValidationErrors = {
  otpRequired: () => t("otp.otpRequired"),
  otpInvalid: () => t("otp.otpInvalid"),
  otpExpired: () => t("otp.otpExpired"),
};

export const ResetPasswordValidationErrors = {
  passwordRequired: () => t("resetPassword.passwordRequired"),
  passwordMinLength: () => t("resetPassword.passwordMinLength"),
  passwordWeak: () => t("resetPassword.passwordWeak"),
  confirmPasswordRequired: () => t("resetPassword.confirmPasswordRequired"),
  passwordsDoNotMatch: () => t("resetPassword.passwordsDoNotMatch"),
};

// e.g usecase setErrors({ email: SignUpValidationErrors.emailRequired() });