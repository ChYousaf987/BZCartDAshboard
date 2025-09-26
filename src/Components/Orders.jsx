import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  fetchNewOrders,
  updateOrderStatus,
  deleteOrder,
  resetNewOrders,
} from "../features/order/orderSlice";
import { PulseLoader } from "react-spinners";
import { toast, Toaster } from "react-hot-toast";

const Orders = () => {
  const dispatch = useDispatch();
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("myUser")) || null,
    []
  );
  const { orders, newOrders, loading, error, lastCheck } = useSelector(
    (state) => state.orders
  );
  const [statusUpdating, setStatusUpdating] = useState({});
  const [deleting, setDeleting] = useState({});

  // Polling for new orders every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (["superadmin", "admin", "team"].includes(user?.role)) {
        dispatch(fetchNewOrders(lastCheck)).catch((err) => {
          console.error("Polling error:", err);
          if (err.message.includes("New orders endpoint unavailable")) {
            toast.error("New orders endpoint not available. Using all orders.", {
              duration: 6000,
            });
          } else {
            toast.error("Failed to fetch new orders. Retrying...");
          }
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [dispatch, user, lastCheck]);

  // Fetch initial orders and reset new orders
  useEffect(() => {
    if (
      ["superadmin", "admin", "team"].includes(user?.role) &&
      !loading &&
      !orders.length
    ) {
      dispatch(fetchOrders()).catch((err) => {
        console.error("Initial fetch error:", err);
        toast.error("Failed to load orders.");
      });
    }
    dispatch(resetNewOrders());
  }, [dispatch, user, loading, orders.length]);

  // Toast notifications for new orders
  useEffect(() => {
    if (newOrders.length > 0) {
      newOrders.forEach((order) => {
        toast.success(
          `New order from ${order.full_name || order.order_email}!`,
          {
            duration: 5000,
            position: "top-right",
            icon: "🛒",
            action: {
              text: "Refresh Now",
              onClick: () => dispatch(fetchOrders()),
            },
          }
        );
      });
    }
  }, [newOrders, dispatch]);

  // Debug logs
  useEffect(() => {
    console.log("Orders state:", orders);
    console.log("New orders state:", newOrders);
    console.log("Last check:", lastCheck);
  }, [orders, newOrders, lastCheck]);

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      await dispatch(
        updateOrderStatus({ id: orderId, status: newStatus })
      ).unwrap();
      toast.success("Order status updated successfully!");
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update order status.");
    } finally {
      setTimeout(() => {
        setStatusUpdating((prev) => ({ ...prev, [orderId]: false }));
      }, 5000);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setDeleting((prev) => ({ ...prev, [orderId]: true }));
    try {
      await dispatch(deleteOrder(orderId)).unwrap();
      toast.success("Order deleted successfully!");
    } catch (err) {
      console.error("Delete order error:", err);
      toast.error("Failed to delete order.");
    } finally {
      setTimeout(() => {
        setDeleting((prev) => ({ ...prev, [orderId]: false }));
      }, 5000);
    }
  };

  const handleManualRefresh = () => {
    if (["superadmin", "admin", "team"].includes(user?.role)) {
      dispatch(fetchOrders()).catch((err) => {
        console.error("Manual refresh error:", err);
        toast.error("Failed to refresh orders.");
      });
    }
  };

  // Use orders state directly
  const displayOrders = useMemo(() => {
    console.log("Display orders:", orders);
    return orders;
  }, [orders]);

  if (!user || !["superadmin", "admin", "team"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-daraz">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full transform transition-transform hover:scale-105 animate-fadeIn z-10">
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-daraz">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full transform transition-transform hover:scale-105 animate-fadeIn z-10">
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
            {error.includes("New orders endpoint unavailable")
              ? "Unable to fetch new orders. Displaying all available orders."
              : error}
          </p>
          <button
            onClick={handleManualRefresh}
            className="mt-4 flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-accent transition-colors text-sm mx-auto"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!displayOrders || displayOrders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-daraz">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full transform transition-transform hover:scale-105 animate-fadeIn z-10">
          <svg
            className="w-16 h-16 text-gray-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3 className="text-2xl md:text-3xl font-bold text-dark mb-4">
            No Orders Found
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            No completed orders available.
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="py-8 font-daraz relative z-0">
      <Toaster position="top-right" />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-dark">
            Orders Management
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-lg text-gray-700">
              Total Orders:{" "}
              <span className="font-medium">
                {
                  displayOrders.filter(
                    (order) => order.payment_status === "completed"
                  ).length
                }
              </span>
            </div>
            <button
              onClick={handleManualRefresh}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-xl overflow-x-auto transform transition-transform hover:shadow-2xl animate-fadeIn relative z-0">
          <table className="w-full text-sm text-left table-auto">
            <thead className="bg-gradient-to-r from-primary to-dark text-white uppercase">
              <tr>
                <th className="px-4 py-3 min-w-[60px]">Image</th>
                <th className="px-4 py-3 min-w-[150px]">Ordered By</th>
                <th className="px-4 py-3 min-w-[120px] hidden sm:table-cell">
                  Phone
                </th>
                <th className="px-4 py-3 min-w-[100px] hidden md:table-cell">
                  Company
                </th>
                <th className="px-4 py-3 min-w-[180px]">Products</th>
                <th className="px-4 py-3 min-w-[80px]">Total</th>
                <th className="px-4 py-3 min-w-[140px]">Status</th>
                <th className="px-4 py-3 min-w-[100px] hidden lg:table-cell">
                  Payment
                </th>
                <th className="px-4 py-3 min-w-[150px] hidden xl:table-cell">
                  Address
                </th>
                <th className="px-4 py-3 min-w-[100px] hidden lg:table-cell">
                  Date
                </th>
                <th className="px-4 py-3 min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders
                .filter((order) => order.payment_status === "completed")
                .map((order, index) => (
                  <tr
                    key={order._id}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition-colors animate-slideInLeft`}
                  >
                    <td className="px-4 py-3">
                      {order.products[0]?.selected_image ? (
                        <img
                          src={order.products[0].selected_image}
                          alt={
                            order.products[0].product_id?.product_name ||
                            "Product"
                          }
                          className="w-10 h-10 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            console.error(
                              "Image load error for order:",
                              order._id,
                              "URL:",
                              order.products[0].selected_image
                            );
                            e.target.src = "https://placehold.co/150x150";
                          }}
                        />
                      ) : (
                        <span className="text-gray-500 text-xs">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-normal text-lg">
                      {order.full_name || order.order_email || (
                        <span className="text-gray-500">No name/email</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-normal text-lg hidden sm:table-cell">
                      {order.phone_number || (
                        <span className="text-gray-500">No phone</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-normal text-lg hidden md:table-cell">
                      {order.products[0]?.product_id?.brand_name || (
                        <span className="text-gray-500">No brand</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-normal text-lg">
                      {order.products.map((item) => (
                        <div
                          key={item.product_id?._id || item.product_id}
                          className="text-sm"
                        >
                          <span className="font-medium">
                            {item.product_id?.product_name || "Unknown Product"}
                          </span>{" "}
                          (x{item.quantity})
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 font-medium text-lg">
                      ${order.total_amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status || "pending"}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        disabled={statusUpdating[order._id]}
                        className={`border rounded-md px-2 py-1 text-sm font-medium w-full ${getStatusStyles(
                          order.status
                        )} focus:outline-none focus:ring-2 focus:ring-primary`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 capitalize text-lg hidden lg:table-cell">
                      {order.payment_status || (
                        <span className="text-gray-500">Unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-normal text-lg hidden xl:table-cell">
                      {order.shipping_address || (
                        <span className="text-gray-500">No address</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-lg hidden lg:table-cell">
                      {order.createdAt ? (
                        new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      ) : (
                        <span className="text-gray-500">No date</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {statusUpdating[order._id] && (
                          <PulseLoader size={6} color="#F26C2B" />
                        )}
                        {user.role === "superadmin" && (
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            disabled={deleting[order._id]}
                            className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors text-sm"
                          >
                            {deleting[order._id] ? (
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
                                Delete
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;