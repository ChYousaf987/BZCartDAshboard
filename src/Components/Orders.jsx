import React from "react";
import { useSelector } from "react-redux";
import { PulseLoader } from "react-spinners";
import { toast, Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";

const Orders = () => {
  const user = JSON.parse(localStorage.getItem("myUser")) || null;
  const { orders, loading, error } = useSelector((state) => state.orders);

  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user || !["superadmin", "admin", "team"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-daraz">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
          <h3 className="text-2xl font-bold text-dark mb-4">Access Denied</h3>
          <p className="text-gray-700">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-daraz">
        <PulseLoader size={15} color="#F26C2B" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-daraz">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
          <h3 className="text-2xl font-bold text-dark mb-4">Error</h3>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 font-daraz">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-dark">Orders</h2>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left" key={orders.length}>
              <thead className="bg-gradient-to-r from-primary to-dark text-white uppercase">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total (Rs)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
                  >
                    <td className="px-4 py-3">{order._id}</td>
                    <td className="px-4 py-3">{order.full_name || "No name"}</td>
                    <td className="px-4 py-3">{order.total_amount?.toFixed(2) || "0.00"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md ${getStatusStyles(order.status)}`}>
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "No date"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-primary hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;