import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  slides: [],
  loading: false,
  error: null,
};

// Create a slide
export const createSlide = createAsyncThunk(
  "slides/createSlide",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:3003/api/slides/create-slide",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create slide"
      );
    }
  }
);

// Fetch all slides
export const fetchSlides = createAsyncThunk(
  "slides/fetchSlides",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://localhost:3003/api/slides/slides"
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.status === 404
          ? "Slides endpoint not found. Please check the server configuration."
          : error.response?.data?.message || "Failed to fetch slides"
      );
    }
  }
);

// Update a slide
export const updateSlide = createAsyncThunk(
  "slides/updateSlide",
  async ({ id, slideData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `http://localhost:3003/api/slides/slide/${id}`,
        slideData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update slide"
      );
    }
  }
);

// Delete a slide
export const deleteSlide = createAsyncThunk(
  "slides/deleteSlide",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:3003/api/slides/slide/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete slide"
      );
    }
  }
);

// Optional: Fetch a single slide by ID (if needed in the future)
export const getSlideById = createAsyncThunk(
  "slides/getSlideById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:3003/api/slides/slide/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch slide"
      );
    }
  }
);

const slideSlice = createSlice({
  name: "slides",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Slide
      .addCase(createSlide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSlide.fulfilled, (state, action) => {
        state.loading = false;
        state.slides.push(action.payload);
      })
      .addCase(createSlide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Slides
      .addCase(fetchSlides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlides.fulfilled, (state, action) => {
        state.loading = false;
        state.slides = action.payload;
      })
      .addCase(fetchSlides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Slide
      .addCase(updateSlide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSlide.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.slides.findIndex(
          (slide) => slide._id === action.payload._id
        );
        if (index !== -1) state.slides[index] = action.payload;
      })
      .addCase(updateSlide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Slide
      .addCase(deleteSlide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSlide.fulfilled, (state, action) => {
        state.loading = false;
        state.slides = state.slides.filter(
          (slide) => slide._id !== action.payload
        );
      })
      .addCase(deleteSlide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Slide By ID
      .addCase(getSlideById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSlideById.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update state.slides or handle single slide
      })
      .addCase(getSlideById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default slideSlice.reducer;
