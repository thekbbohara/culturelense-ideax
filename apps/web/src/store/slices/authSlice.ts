import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  userId: string | null;
  email: string | null;
  vendorId: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  userId: null,
  email: null,
  vendorId: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{
        userId: string | null;
        email: string | null;
        vendorId: string | null;
      }>,
    ) => {
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.vendorId = action.payload.vendorId;
      state.isInitialized = true;
    },
    clearAuth: (state) => {
      state.userId = null;
      state.email = null;
      state.vendorId = null;
      state.isInitialized = true;
    },
    setVendorId: (state, action: PayloadAction<string | null>) => {
      state.vendorId = action.payload;
    },
  },
});

export const { setAuth, clearAuth, setVendorId } = authSlice.actions;
export default authSlice.reducer;
