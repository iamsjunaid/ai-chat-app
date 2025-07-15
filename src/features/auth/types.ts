export interface AuthState {
  phone: string;
  country: string;
  otp: string;
  isAuthenticated: boolean;
}

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
} 