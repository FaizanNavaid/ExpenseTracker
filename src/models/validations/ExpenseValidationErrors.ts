import i18n from "../../config/localization/i18n";

const t = (key: string) => i18n.t(key);

export const AddExpenseValidationErrors = {
  titleRequired: () => t("addExpense.titleRequired"),
  amountRequired: () => t("addExpense.amountRequired"),
  amountInvalid: () => t("addExpense.amountInvalid"),
  categoryRequired: () => t("addExpense.categoryRequired"),
  dateRequired: () => t("addExpense.dateRequired"),
};

// e.g usecase setErrors({ amount: AddExpenseValidationErrors.amountRequired() });
