export const SCREENS = {
  // Splash / Onboarding
  SPLASH: "Splash",
  ONBOARDING: "Onboarding",

  // Auth
  LOGIN: "Login",
  SIGN_UP: "SignUp",
  FORGOT_PASSWORD: "ForgotPassword",
  RESET_PASSWORD: "ResetPassword",
  VERIFY_OTP: "VerifyOtp",

  // Tabs
  HOME: "Home",
  PROFILE: "Profile",
  MAIN:"Main",
  TABS:"Tabs",

  // Expense / Income
  ADD_EXPENSE: "AddExpense",
  EDIT_EXPENSE: "EditExpense",
  ADD_INCOME: "AddIncome",

  // Transactions
  TRANSACTION_HISTORY: "TransactionHistory",
  TRANSACTION_DETAILS: "TransactionDetails",
  SEARCH_TRANSACTIONS: "SearchTransactions",

  // Category / Budget / Analytics
  CATEGORY: "Category",
  BUDGET: "Budget",
  ANALYTICS: "Analytics",

  // Profile
  EDIT_PROFILE: "EditProfile",

  // Drawer
  SETTINGS: "Settings",
  PRIVACY: "Privacy",
} as const;

export type ScreenName = (typeof SCREENS)[keyof typeof SCREENS];