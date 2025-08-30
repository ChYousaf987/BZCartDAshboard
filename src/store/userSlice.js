import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  pendingUsers: [],
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "users/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await axios.post(
        "http://localhost:3003/api/admins/login-admin",
        { email, password }
      );
      const userData = {
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
        token: response.data.token,
      };
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "users/registerUser",
  async ({ username, email, password }, thunkAPI) => {
    try {
      const response = await axios.post(
        "http://localhost:3003/api/users/register-user",
        { username, email, password }
      );
      const userData = {
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
        token: response.data.token,
      };
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const createAdmin = createAsyncThunk(
  "users/createAdmin",
  async ({ username, email, password }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3003/api/admins/create-admin",
        { username, email, password },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchPendingUsers = createAsyncThunk(
  "users/fetchPendingUsers",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const response = await axios.get(
        "http://localhost:3003/api/users/pending-users",
        config
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const approveUser = createAsyncThunk(
  "users/approveUser",
  async (userId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const response = await axios.post(
        "http://localhost:3003/api/users/approve-user",
        { userId },
        config
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.pendingUsers = [];
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPendingUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingUsers = action.payload;
        state.error = null;
      })
      .addCase(fetchPendingUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingUsers = state.pendingUsers.filter(
          (user) => user._id !== action.payload.user._id
        );
        state.error = null;
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;