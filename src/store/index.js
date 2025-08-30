import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import userReducer from "../store/userSlice";
import slideReducer from "../features/slides/slideSlice";
import orderReducer from "../features/order/orderSlice";
import brandReducer from "../features/brands/brandSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    users: userReducer,
    slides: slideReducer,
    orders: orderReducer,
     brands: brandReducer,
  },
});
