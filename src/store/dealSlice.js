import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://bzbackend.online";

export const fetchDeals = createAsyncThunk("deals/fetchDeals", async () => {
  const response = await axios.get(`${BASE_URL}/api/deals`);
  return response.data;
});

export const fetchDealById = createAsyncThunk(
  "deals/fetchDealById",
  async (id) => {
    const response = await axios.get(`${BASE_URL}/api/deal/${id}`);
    return response.data;
  }
);

export const createDeal = createAsyncThunk(
  "deals/createDeal",
  async (dealData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/create-deal`,
        dealData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create deal"
      );
    }
  }
);

export const updateDeal = createAsyncThunk(
  "deals/updateDeal",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/deal/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update deal"
      );
    }
  }
);

export const deleteDeal = createAsyncThunk(
  "deals/deleteDeal",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/deal/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete deal"
      );
    }
  }
);

const dealSlice = createSlice({
  name: "deals",
  initialState: {
    deals: [],
    currentDeal: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.deals = [];
      })
      .addCase(fetchDealById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDealById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDeal = action.payload;
      })
      .addCase(fetchDealById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.deals.push(action.payload);
      })
      .addCase(createDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = state.deals.map((deal) =>
          deal._id === action.payload._id ? action.payload : deal
        );
        state.currentDeal = action.payload;
      })
      .addCase(updateDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.deals = state.deals.filter((deal) => deal._id !== action.payload);
      });
  },
});

export default dealSlice.reducer;
