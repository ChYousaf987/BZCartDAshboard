import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import userReducer from "../store/userSlice";
import slideReducer from "../features/slides/slideSlice";
import orderReducer from "../features/order/orderSlice";
import dealReducer from "./dealSlice"; // Add this line


export const store = configureStore({
  reducer: {
    products: productReducer,
    users: userReducer,
    slides: slideReducer,
    orders: orderReducer,
    deals: dealReducer, // Add this line
  },
});
