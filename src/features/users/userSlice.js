import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logUser, regUser, verifyOTP } from "./userService";

const isUser = JSON.parse(localStorage.getItem("myUser"));

const initialState = {
  user: isUser ? isUser : null,
  userLoading: false,
  userMessage: "",
  userError: false,
  userSuccess: false,
};

export const registerMyUser = createAsyncThunk(
  "register-user",
  async (data, thunkAPI) => {
    try {
      return await regUser(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const loginMyUser = createAsyncThunk(
  "login-user",
  async (data, thunkAPI) => {
    try {
      return await logUser(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const verifyOTPData = createAsyncThunk(
  "verify-OTP",
  async (otpData, thunkAPI) => {
    try {
      let token = thunkAPI.getState().auth.user.token;
      return await verifyOTP(otpData, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const myUserSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userReset: (state) => {
      state.userLoading = false;
      state.userError = false;
      state.userSuccess = false;
      state.userMessage = "";
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem("myUser");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerMyUser.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(registerMyUser.rejected, (state, action) => {
        state.userLoading = false;
        state.userMessage = action.payload;
        state.userError = true;
      })
      .addCase(registerMyUser.fulfilled, (state, action) => {
        state.userLoading = false;
        state.userSuccess = true;
        state.user = action.payload;
      })
      .addCase(loginMyUser.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(loginMyUser.rejected, (state, action) => {
        state.userLoading = false;
        state.userMessage = action.payload;
        state.userError = true;
      })
      .addCase(loginMyUser.fulfilled, (state, action) => {
        state.userLoading = false;
        state.userSuccess = true;
        state.user = action.payload;
      })
      .addCase(verifyOTPData.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(verifyOTPData.rejected, (state, action) => {
        state.userLoading = false;
        state.userMessage = action.payload;
        state.userError = true;
      })
      .addCase(verifyOTPData.fulfilled, (state, action) => {
        state.userLoading = false;
        state.userSuccess = true;
        state.user = action.payload;
      });
  },
});

export default myUserSlice.reducer;
export const { userReset, logoutUser } = myUserSlice.actions;
