import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  BrowserRouter as Router,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "./features/order/orderSlice";
import { toast } from "react-hot-toast";
import Navbar from "./Components/Navbar.jsx";
import Sidebar from "./Components/Sidebar.jsx";
import Product from "./Components/Product.jsx";
import AddProduct from "./Components/AddProduct.jsx";
import EditProduct from "./Components/EditProduct.jsx";
import Login from "./Components/Login.jsx";
import AddSliders from "./Components/AddSliders.jsx";
import Orders from "./Components/Orders.jsx";
import CompletedOrders from "./Components/CompletedOrders.jsx";
import OrderDetails from "./Components/OrderDetails.jsx";
import PendingUsers from "./Components/PendingUsers.jsx";
import ManageCategories from "./Components/ManageCategories.jsx";
import { Toaster } from "react-hot-toast";
import Reels from "./Components/Reels.jsx";
import AllUser from "./Components/AllUser.jsx";
import Deals from "./Components/Deals.jsx";
import AddDeal from "./Components/AddDeal.jsx";
import EditDeal from "./Components/EditDeal.jsx";
import Campaigns from "./Components/Campaigns.jsx";
import FridayBanner from "./Components/FridayBanner.jsx";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("myUser"));
  const dispatch = useDispatch();
  const { newOrders } = useSelector((state) => state.orders);

  useEffect(() => {
    if (["superadmin", "admin", "team"].includes(user?.role)) {
      const fetchAndLogOrders = () => {
        console.log("Fetching orders...");
        dispatch(fetchOrders())
          .unwrap()
          .then((fetchedOrders) => {
            console.log("Orders fetched successfully:", fetchedOrders.length);
            if (newOrders.length > 0) {
              toast.success(`${newOrders.length} new order(s) received!`);
            }
          })
          .catch((err) => {
            console.error("Fetch orders error:", err);
            toast.error("Failed to load orders.");
          });
      };

      // Initial fetch
      fetchAndLogOrders();

      // Poll every 10 seconds
      const interval = setInterval(fetchAndLogOrders, 10000);

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [dispatch, user?.role, newOrders.length]);

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
          path="/completed-orders"
          element={
            <ProtectedRoute>
              <CompletedOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
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
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friday-banner"
          element={
            <ProtectedRoute>
              <FridayBanner />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
