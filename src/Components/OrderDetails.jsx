import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOrderById, updateOrderStatus, deleteOrder } from "../features/order/orderSlice";
import { PulseLoader } from "react-spinners";
import { toast, Toaster } from "react-hot-toast";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("myUser")) || null;
  const { currentOrder, loading, error } = useSelector((state) => state.orders);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (["superadmin", "admin", "team"].includes(user?.role)) {
      console.log("Fetching order with ID:", id);
      dispatch(fetchOrderById(id))
        .unwrap()
        .then((order) => {
          console.log("Order fetched successfully:", order);
        })
        .catch((err) => {
          console.error("Fetch order details error:", err);
          toast.error("Failed to load order details.");
        });
    }
  }, [dispatch, id, user?.role]);

  useEffect(() => {
    console.log("Current state:", { currentOrder, loading, error });
  }, [currentOrder, loading, error]);

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await dispatch(updateOrderStatus({ id, status: newStatus })).unwrap();
      toast.success("Order status updated successfully!");
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update order status.");
    } finally {
      setTimeout(() => setStatusUpdating(false), 5000);
    }
  };

  const handleDeleteOrder = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteOrder(id)).unwrap();
      toast.success("Order deleted successfully!");
      navigate("/orders");
    } catch (err) {
      console.error("Delete order error:", err);
      toast.error("Failed to delete order.");
    } finally {
      setTimeout(() => setDeleting(false), 5000);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (!user || !["superadmin", "admin", "team"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-daraz">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full transform transition-transform hover:scale-105 animate-fadeIn">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-2xl md:text-3xl font-bold text-dark mb-4">
            Access Denied
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-daraz">
        <PulseLoader size={15} color="#F26C2B" />
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-daraz">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full transform transition-transform hover:scale-105 animate-fadeIn">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-2xl md:text-3xl font-bold text-dark mb-4">Error</h3>
          <p className="text-red-500 leading-relaxed text-lg">
            {error || "Order not found"}
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-accent transition-colors text-sm mx-auto"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 font-daraz">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-dark">
            Order Details - {currentOrder._id}
          </h2>
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-accent transition-colors text-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Orders
          </button>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 transform transition-transform hover:shadow-2xl animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-dark mb-4">Customer Information</h3>
              <p><strong>Name:</strong> {currentOrder.full_name || "No name"}</p>
              <p><strong>Email:</strong> {currentOrder.order_email || "No email"}</p>
              <p><strong>Phone:</strong> {currentOrder.phone_number || "No phone"}</p>
              <p><strong>Shipping Address:</strong> {currentOrder.shipping_address || "No address"}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-dark mb-4">Order Information</h3>
              <p><strong>Order ID:</strong> {currentOrder._id}</p>
              <p><strong>Date:</strong> {currentOrder.createdAt ? new Date(currentOrder.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }) : "No date"}</p>
              <p><strong>Payment Status:</strong> {currentOrder.payment_status || "Unknown"}</p>
              <p><strong>Total Amount:</strong> Rs {currentOrder.total_amount?.toFixed(2) || "0.00"}</p>
              {currentOrder.discount_applied && (
                <p><strong>Discount Applied:</strong> {currentOrder.discount_code || "Unknown"} (Original: Rs {currentOrder.original_amount?.toFixed(2) || "0.00"})</p>
              )}
              <div className="mt-4">
                <strong>Status:</strong>
                <select
                  value={currentOrder.status || "pending"}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusUpdating}
                  className={`ml-2 border rounded-md px-2 py-1 text-sm font-medium ${getStatusStyles(currentOrder.status)} focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {statusUpdating && <PulseLoader size={6} color="#F26C2B" className="ml-2 inline" />}
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-dark mt-6 mb-4">Products</h3>
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
                {currentOrder.products.map((item, index) => (
                  <tr
                    key={item.product_id?._id || index}
                    className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-4 py-3">
                      {item.selected_image ? (
                        <img
                          src={item.selected_image}
                          alt={item.product_id?.product_name || "Product"}
                          className="w-12 h-12 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            console.error("Image load error for product:", item.product_id?._id);
                            e.target.src = "https://placehold.co/150x150";
                          }}
                        />
                      ) : (
                        <span className="text-gray-500 text-xs">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{item.product_id?.product_name || "Unknown Product"}</td>
                    <td className="px-4 py-3">{item.product_id?.brand_name || "No brand"}</td>
                    <td className="px-4 py-3">{item.selected_size || "N/A"}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td colSpan="4" className="px-4 py-3 text-right">Total Amount:</td>
                  <td className="px-4 py-3">Rs {currentOrder.total_amount?.toFixed(2) || "0.00"}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {user.role === "superadmin" && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleDeleteOrder}
                disabled={deleting}
                className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? (
                  <PulseLoader size={6} color="#ffffff" />
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Order
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;