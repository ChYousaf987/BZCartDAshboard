import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import brandService from "./brandService";

export const addBrand = createAsyncThunk(
  "brands/addBrand",
  async (brandData, { rejectWithValue }) => {
    console.log("addBrand action called with data:", brandData);
    try {
      const response = await brandService.addBrand(brandData);
      console.log("addBrand action response:", response);
      return response.data;
    } catch (error) {
      console.error("addBrand action error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchBrands = createAsyncThunk(
  "brands/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await brandService.getBrands();
      console.log("fetchBrands action response:", response);
      return response.data; // Expect { success: true, data: [...] }
    } catch (error) {
      console.error("fetchBrands action error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteBrand = createAsyncThunk(
  "brands/deleteBrand",
  async (id, { rejectWithValue }) => {
    console.log("deleteBrand action called with id:", id);
    try {
      const response = await brandService.deleteBrand(id);
      console.log("deleteBrand action response:", response);
      return id; // Return id to remove from state
    } catch (error) {
      console.error("deleteBrand action error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const brandSlice = createSlice({
  name: "brands",
  initialState: {
    brands: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands.push(action.payload);
      })
      .addCase(addBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = state.brands.filter(
          (brand) => brand._id !== action.payload
        );
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default brandSlice.reducer;
