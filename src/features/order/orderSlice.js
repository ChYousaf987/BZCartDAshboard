import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://bzbackend.online/api/orders";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/orders`);
      console.log("Fetch orders response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch orders error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const fetchNewOrders = createAsyncThunk(
  "orders/fetchNewOrders",
  async (lastCheck, { rejectWithValue, getState }) => {
    try {
      const url = lastCheck
        ? `${BASE_URL}/orders?since=${lastCheck}`
        : `${BASE_URL}/orders`;
      console.log("Fetching new orders from:", url);
      const response = await axios.get(url);
      const orders = response.data;
      const existingOrderIds = new Set([
        ...getState().orders.orders.map((o) => o._id),
        ...getState().orders.newOrders.map((o) => o._id),
      ]);
      const newOrders = lastCheck
        ? orders.filter(
            (order) =>
              new Date(order.createdAt) > new Date(lastCheck) &&
              !existingOrderIds.has(order._id)
          )
        : orders.filter((order) => !existingOrderIds.has(order._id));
      console.log("New orders fetched:", newOrders);
      return newOrders;
    } catch (error) {
      console.error("Fetch new orders error:", {
        url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      if (error.response?.status === 404) {
        console.warn("New orders endpoint not found, falling back to fetchOrders");
        try {
          const response = await axios.get(`${BASE_URL}/orders`);
          const orders = response.data;
          const existingOrderIds = new Set([
            ...getState().orders.orders.map((o) => o._id),
            ...getState().orders.newOrders.map((o) => o._id),
          ]);
          const newOrders = lastCheck
            ? orders.filter(
                (order) =>
                  new Date(order.createdAt) > new Date(lastCheck) &&
                  !existingOrderIds.has(order._id)
              )
            : orders.filter((order) => !existingOrderIds.has(order._id));
          return newOrders;
        } catch (fallbackError) {
          console.error("Fallback fetch error:", fallbackError.message);
          return rejectWithValue(
            "New orders endpoint unavailable, and fallback fetch failed."
          );
        }
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch new orders"
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/orders/${id}`, { status });
      console.log("Update order status response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Update order status error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/orders/${id}`);
      console.log("Order deleted:", id);
      return id;
    } catch (error) {
      console.error("Delete order error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete order"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    newOrders: [],
    loading: false,
    error: null,
    lastCheck: new Date().toISOString(),
  },
  reducers: {
    resetNewOrders: (state) => {
      state.newOrders = [];
      state.lastCheck = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.newOrders = [];
        state.lastCheck = new Date().toISOString();
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchNewOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = [
          ...action.payload,
          ...state.orders.filter(
            (order) => !action.payload.some((newOrder) => newOrder._id === order._id)
          ),
        ];
        state.newOrders = action.payload;
        state.lastCheck = new Date().toISOString();
      })
      .addCase(fetchNewOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        const newIndex = state.newOrders.findIndex(
          (order) => order._id === action.payload._id
        );
        if (newIndex !== -1) {
          state.newOrders[newIndex] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload
        );
        state.newOrders = state.newOrders.filter(
          (order) => order._id !== action.payload
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetNewOrders } = orderSlice.actions;
export default orderSlice.reducer;