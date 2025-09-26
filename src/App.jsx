import React, { useEffect } from "react";
import { Routes, Route, Navigate, BrowserRouter as Router } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNewOrders } from "./features/order/orderSlice";
import { toast } from "react-hot-toast";
import Navbar from "./Components/Navbar.jsx";
import Sidebar from "./Components/Sidebar.jsx";
import Product from "./Components/Product.jsx";
import AddProduct from "./Components/AddProduct.jsx";
import EditProduct from "./Components/EditProduct.jsx";
import Login from "./Components/Login.jsx";
import AddSliders from "./Components/AddSliders.jsx";
import Orders from "./Components/Orders.jsx";
import PendingUsers from "./Components/PendingUsers.jsx";
import ManageCategories from "./Components/ManageCategories.jsx";
import { Toaster } from "react-hot-toast";
import Reels from "./Components/Reels.jsx";
import AllUser from "./Components/AllUser.jsx";
import Deals from "./Components/Deals.jsx";
import AddDeal from "./Components/AddDeal.jsx";
import EditDeal from "./Components/EditDeal.jsx";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("myUser"));
  const dispatch = useDispatch();
  const { newOrders, lastCheck } = useSelector((state) => state.orders);
  const [notifiedOrderIds, setNotifiedOrderIds] = React.useState(new Set());

  // Global polling for new orders every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (["superadmin", "admin", "team"].includes(user?.role)) {
        dispatch(fetchNewOrders(lastCheck)).catch((err) => {
          console.error("Global polling error:", err);
          toast.error("Failed to fetch new orders. Retrying...");
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch, user, lastCheck]);

  // Global toast notifications for new orders
  useEffect(() => {
    if (newOrders.length > 0) {
      newOrders.forEach((order) => {
        if (!notifiedOrderIds.has(order._id)) {
          toast.success(
            `New order from ${order.full_name || order.order_email}!`,
            {
              duration: 5000,
              position: "top-right",
              icon: "🛒",
              action: {
                text: "View Orders",
                onClick: () => window.location.href = "/orders",
              },
            }
          );
          setNotifiedOrderIds((prev) => new Set([...prev, order._id]));
        }
      });
    }
  }, [newOrders, notifiedOrderIds]);

  if (!user || !["superadmin", "admin", "team"].includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-daraz">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[15rem] z-0">
        <Navbar />
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product"
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-product/:id"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-slider"
          element={
            <ProtectedRoute>
              <AddSliders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending-users"
          element={
            <ProtectedRoute>
              <PendingUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reels"
          element={
            <ProtectedRoute>
              <Reels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AllUser"
          element={
            <ProtectedRoute>
              <AllUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-categories"
          element={
            <ProtectedRoute>
              <ManageCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <div>Messages Page (Superadmin Only)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <div>Reports Page (Superadmin Only)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/deals"
          element={
            <ProtectedRoute>
              <Deals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-deal"
          element={
            <ProtectedRoute>
              <AddDeal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-deal/:id"
          element={
            <ProtectedRoute>
              <EditDeal />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;