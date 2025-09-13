import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import AddBrands from "./Components/AddBrands.jsx";
import ManageBrands from "./Components/ManageBrands.jsx";
import { Toaster } from "react-hot-toast";
import Reels from "./Components/Reels.jsx";
import AllUser from "./Components/AllUser.jsx";
import Deals from "./Components/Deals.jsx"; // Add this line
import AddDeal from "./Components/AddDeal.jsx"; // Add this line
import EditDeal from "./Components/EditDeal.jsx"; // Add this line

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("myUser"));

  if (!user || !["superadmin", "admin", "team"].includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-60">
        <Navbar />
        <div className="flex-1 p-6">{children}</div>
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
          path="/manage-brands"
          element={
            <ProtectedRoute>
              <ManageBrands />
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
          path="/add-brands"
          element={
            <ProtectedRoute>
              <AddBrands />
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
