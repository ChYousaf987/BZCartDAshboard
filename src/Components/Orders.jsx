import React from "react";
import { useSelector } from "react-redux";
import { PulseLoader } from "react-spinners";
import { toast, Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Orders = () => {
  const user = JSON.parse(localStorage.getItem("myUser")) || null;
  const { orders, loading, error } = useSelector((state) => state.orders);

  // Prepare data for charts
  const pendingOrders = orders.filter((o) => o.status !== "delivered");
  const statusCounts = pendingOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color:
      status === "pending"
        ? "#F59E0B"
        : status === "processing"
        ? "#3B82F6"
        : status === "shipped"
        ? "#8B5CF6"
        : "#EF4444",
  }));

  const recentOrders = pendingOrders.slice(0, 10).map((order) => ({
    id: order._id.slice(-8),
    customer: order.full_name || "No name",
    amount: order.total_amount || 0,
    status: order.status,
  }));

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

  // Function to get sizes for an order
  const getOrderSizes = (products) => {
    const sizes = products
      .map((item) => item.selected_size)
      .filter((size) => size) // Remove null/undefined
      .join(", ");
    return sizes || "N/A";
  };

  if (!user || !["superadmin", "admin", "team"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-daraz">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
          <h3 className="text-2xl font-bold text-dark mb-4">Access Denied</h3>
          <p className="text-gray-700">
            You do not have permission to view this page.
          </p>
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

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-3xl shadow-xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold">{pendingOrders.length}</p>
            <p className="text-sm opacity-90">Pending/Processing</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-3xl shadow-xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Pending</h3>
            <p className="text-3xl font-bold">{statusCounts.pending || 0}</p>
            <p className="text-sm opacity-90">Awaiting Action</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl shadow-xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Processing</h3>
            <p className="text-3xl font-bold">{statusCounts.processing || 0}</p>
            <p className="text-sm opacity-90">In Progress</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl shadow-xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Shipped</h3>
            <p className="text-3xl font-bold">{statusCounts.shipped || 0}</p>
            <p className="text-sm opacity-90">On the Way</p>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Order Status Distribution */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-dark mb-4">
              Order Status Distribution
            </h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders Bar Chart */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-dark mb-4">
              Recent Order Values
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recentOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`Rs ${value.toFixed(2)}`, "Amount"]}
                />
                <Legend />
                <Bar dataKey="amount" fill="#F26C2B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left" key={orders.length}>
              <thead className="bg-gradient-to-r from-primary to-dark text-white uppercase">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Total (Rs)</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter((o) => o.status !== "delivered")
                  .map((order, index) => (
                    <tr
                      key={order._id}
                      className={`border-b ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-4 py-3">{order._id}</td>
                      <td className="px-4 py-3">
                        {order.full_name || "No name"}
                      </td>
                      <td className="px-4 py-3">{order.city || "N/A"}</td>
                      <td className="px-4 py-3">
                        {order.total_amount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-3">
                        {getOrderSizes(order.products)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-md ${getStatusStyles(
                            order.status
                          )}`}
                        >
                          {order.status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
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
