import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  phone: string;
  country: string;
  otp: string;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  phone: '',
  country: '',
  otp: '',
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPhone(state, action: PayloadAction<string>) {
      state.phone = action.payload;
    },
    setCountry(state, action: PayloadAction<string>) {
      state.country = action.payload;
    },
    setOtp(state, action: PayloadAction<string>) {
      state.otp = action.payload;
    },
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },
    resetAuth(state) {
      state.phone = '';
      state.country = '';
      state.otp = '';
      state.isAuthenticated = false;
    },
  },
});

export const { setPhone, setCountry, setOtp, setAuthenticated, resetAuth } = authSlice.actions;
export default authSlice.reducer; 