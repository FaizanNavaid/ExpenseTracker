

export interface LoginModel {
  email_address: string;
  password: string;
}

export interface SignUpModel {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export interface ForgotPassModel {
  forgot_password: string;
}

export interface OtpModel {
  email_address: string;
  flowType: string;
  otp: string;
}

export interface ResetPassModel {
  otp: string;
  new_password: string;
  new_confirm_password: string;
}

export interface AddExpenseModel {
  title: string;
  amount: string;
  category_id: string;
  expense_date: string;
  note: string;
  receipt_image: string | null;
}

export interface CategoryModel {
  _id: string;
  name: string;
  icon?: string;
  color?: string;
}

export type ErrorModel = {
  first_name?: string;
  last_name?: string;
  email_address?: string;
  phone_number?: string;
  password?: string;
  confirm_password?: string;
  forgot_password?: string;
};

export type AddExpenseErrorModel = {
  title?: string;
  amount?: string;
  category_id?: string;
  expense_date?: string;
};