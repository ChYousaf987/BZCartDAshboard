import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as slideService from "./slideServices";

export const fetchSlides = createAsyncThunk("slides/fetchSlides", async () => {
  return await slideService.getSlides();
});

export const fetchSlideById = createAsyncThunk(
  "slides/fetchSlideById",
  async (id) => {
    return await slideService.getSlideById(id);
  }
);

export const createSlide = createAsyncThunk(
  "slides/createSlide",
  async (slideData) => {
    return await slideService.createSlide(slideData);
  }
);

export const updateSlide = createAsyncThunk(
  "slides/updateSlide",
  async ({ id, slideData }) => {
    return await slideService.updateSlide(id, slideData);
  }
);

export const deleteSlide = createAsyncThunk("slides/deleteSlide", async (id) => {
  await slideService.deleteSlide(id);
  return id;
});

const slideSlice = createSlice({
  name: "slides",
  initialState: {
    slides: [],
    slide: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
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
        state.error = action.error.message;
      })
      .addCase(fetchSlideById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.slide = null;
      })
      .addCase(fetchSlideById.fulfilled, (state, action) => {
        state.loading = false;
        state.slide = action.payload;
      })
      .addCase(fetchSlideById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
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
        state.error = action.error.message;
      })
      .addCase(updateSlide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSlide.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.slides.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.slides[index] = action.payload;
        }
        if (state.slide && state.slide._id === action.payload._id) {
          state.slide = action.payload;
        }
      })
      .addCase(updateSlide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteSlide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSlide.fulfilled, (state, action) => {
        state.loading = false;
        state.slides = state.slides.filter((s) => s._id !== action.payload);
        if (state.slide && state.slide._id === action.payload) {
          state.slide = null;
        }
      })
      .addCase(deleteSlide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default slideSlice.reducer;