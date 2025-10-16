import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteOrder } from "../features/order/orderSlice";
import { PulseLoader } from "react-spinners";
import { toast, Toaster } from "react-hot-toast";

const CompletedOrders = () => {
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("myUser")) || null;
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [expanded, setExpanded] = useState(null);

  const completed = orders.filter((o) => o.status === "delivered");

  // Calculate sales totals
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);

  const dailySales = completed
    .filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    })
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const monthlySales = completed
    .filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= thisMonth;
    })
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const yearlySales = completed
    .filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= thisYear;
    })
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await dispatch(deleteOrder(id)).unwrap();
      toast.success("Order deleted");
      if (expanded === id) setExpanded(null);
    } catch (err) {
      console.error("Delete failed", err);
      toast.error(err || "Failed to delete order");
    }
  };

  const toggleDetails = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
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
          <h2 className="text-2xl md:text-3xl font-bold text-dark">
            Completed Orders
          </h2>
        </div>

        {/* Sales Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-dark mb-2">Daily Sales</h3>
            <p className="text-2xl font-bold text-primary">Rs {dailySales.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-dark mb-2">Monthly Sales</h3>
            <p className="text-2xl font-bold text-primary">Rs {monthlySales.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-dark mb-2">Yearly Sales</h3>
            <p className="text-2xl font-bold text-primary">Rs {yearlySales.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gradient-to-r from-primary to-dark text-white uppercase">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total (Rs)</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {completed.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No delivered orders found.
                    </td>
                  </tr>
                )}
                {completed.map((order, index) => (
                  <React.Fragment key={order._id}>
                    <tr
                      className={`border-b ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-4 py-3">{order._id}</td>
                      <td className="px-4 py-3">
                        {order.full_name || "No name"}
                      </td>
                      <td className="px-4 py-3">
                        {order.total_amount?.toFixed(2) || "0.00"}
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
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "No time"}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => toggleDetails(order._id)}
                          className="bg-primary hover:bg-accent text-white px-3 py-1 rounded-md"
                        >
                          {expanded === order._id ? "Hide" : "View"}
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {expanded === order._id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-4 py-6">
                          <div className="bg-white rounded-2xl p-6 shadow-inner">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-xl font-semibold text-dark mb-4">
                                  Customer Information
                                </h3>
                                <p>
                                  <strong>Name:</strong>{" "}
                                  {order.full_name || "No name"}
                                </p>
                                <p>
                                  <strong>Email:</strong>{" "}
                                  {order.order_email ||
                                    order.email ||
                                    "No email"}
                                </p>
                                <p>
                                  <strong>Phone:</strong>{" "}
                                  {order.phone_number || "No phone"}
                                </p>
                                <p>
                                  <strong>Shipping Address:</strong>{" "}
                                  {order.shipping_address || "No address"}
                                </p>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-dark mb-4">
                                  Order Information
                                </h3>
                                <p>
                                  <strong>Order ID:</strong> {order._id}
                                </p>
                                <p>
                                  <strong>Date:</strong>{" "}
                                  {order.createdAt
                                    ? new Date(
                                        order.createdAt
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })
                                    : "No date"}
                                </p>
                                <p>
                                  <strong>Payment Status:</strong>{" "}
                                  {order.payment_status || "Unknown"}
                                </p>
                                <p>
                                  <strong>Total Amount:</strong> Rs{" "}
                                  {order.total_amount?.toFixed(2) || "0.00"}
                                </p>
                                {order.discount_applied && (
                                  <p>
                                    <strong>Discount Applied:</strong>{" "}
                                    {order.discount_code || "Unknown"}{" "}
                                    (Original: Rs{" "}
                                    {order.original_amount?.toFixed(2) ||
                                      "0.00"}
                                    )
                                  </p>
                                )}
                                <p className="mt-2">
                                  <strong>Status:</strong>{" "}
                                  <span className="ml-2 font-medium">
                                    {order.status || "pending"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <h3 className="text-xl font-semibold text-dark mt-6 mb-4">
                              Products
                            </h3>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-gradient-to-r from-primary to-dark text-white uppercase">
                                  <tr>
                                    <th className="px-4 py-3">Image</th>
                                    <th className="px-4 py-3">Product Name</th>
                                    <th className="px-4 py-3">Brand</th>
                                    <th className="px-4 py-3">Size</th>
                                    <th className="px-4 py-3">Quantity</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(order.products || []).map((item, idx) => (
                                    <tr
                                      key={item.product_id?._id || idx}
                                      className={`border-b ${
                                        idx % 2 === 0
                                          ? "bg-white"
                                          : "bg-gray-50"
                                      } hover:bg-gray-100`}
                                    >
                                      <td className="px-4 py-3">
                                        {item.selected_image ? (
                                          <img
                                            src={item.selected_image}
                                            alt={
                                              item.product_id?.product_name ||
                                              "Product"
                                            }
                                            className="w-12 h-12 object-cover rounded-md border border-gray-200"
                                            onError={(e) => {
                                              e.target.src =
                                                "https://placehold.co/150x150";
                                            }}
                                          />
                                        ) : (
                                          <span className="text-gray-500 text-xs">
                                            No image
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        {item.product_id?.product_name ||
                                          item.name ||
                                          "Unknown Product"}
                                      </td>
                                      <td className="px-4 py-3">
                                        {item.product_id?.brand_name ||
                                          item.brand ||
                                          "No brand"}
                                      </td>
                                      <td className="px-4 py-3">
                                        {item.selected_size || "N/A"}
                                      </td>
                                      <td className="px-4 py-3">
                                        {item.quantity}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="bg-gray-100 font-semibold">
                                    <td
                                      colSpan="4"
                                      className="px-4 py-3 text-right"
                                    >
                                      Total Amount:
                                    </td>
                                    <td className="px-4 py-3">
                                      Rs{" "}
                                      {order.total_amount?.toFixed(2) || "0.00"}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedOrders;