import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, updateOrderStatus, deleteOrder } from "../features/order/orderSlice";
import { PulseLoader } from "react-spinners";
import { toast, Toaster } from "react-hot-toast";

const Orders = () => {
  const dispatch = useDispatch();
  const user = useMemo(() => JSON.parse(localStorage.getItem("myUser")) || null, []);
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    console.log("Current user:", user);
    if (["superadmin", "admin", "team"].includes(user?.role) && !loading && !orders.length) {
      dispatch(fetchOrders());
    }
  }, [dispatch, user, loading, orders.length]);

  useEffect(() => {
    console.log("Orders data:", orders);
  }, [orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    console.log("Status updating for order:", orderId, "to:", newStatus, "current state:", statusUpdating);
    setStatusUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
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
    console.log("Deleting order:", orderId, "current state:", deleting);
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

  if (!user || !["superadmin", "admin", "team"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
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
          <h3 className="text-2xl font-semibold text-gray-800">Access Denied</h3>
          <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <PulseLoader size={15} color="#2563eb" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
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
          <h3 className="text-2xl font-semibold text-gray-800">Error</h3>
          <p className="text-red-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const dummyOrders = [
    {
      _id: "dummy-order-1",
      user_id: "1",
      order_email: "superadmin@example.com",
      phone_number: "+12345678901",
      products: [
        {
          product_id: { _id: "prod1", product_name: "Gold Necklace", brand_name: "JewelCo" },
          quantity: 1,
          selected_image: "https://placehold.co/150x150",
        },
      ],
      total_amount: 99.99,
      shipping_address: "123 Test St",
      status: "pending",
      payment_status: "completed",
      createdAt: new Date(),
    },
    {
      _id: "dummy-order-2",
      user_id: "guest_12345",
      order_email: "guest.user@example.com",
      phone_number: "+19876543210",
      products: [
        {
          product_id: { _id: "prod2", product_name: "Silver Ring", brand_name: "JewelCo" },
          quantity: 2,
          selected_image: "https://placehold.co/150x150",
        },
      ],
      total_amount: 199.98,
      shipping_address: "456 Guest St",
      status: "pending",
      payment_status: "completed",
      createdAt: new Date(),
    },
  ];

  const displayOrders = orders && orders.length > 0 ? orders : dummyOrders;

  if (!displayOrders || displayOrders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
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
          <h3 className="text-2xl font-semibold text-gray-800">No Orders Found</h3>
          <p className="text-gray-600 mt-2">No completed orders available.</p>
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
    <div className="min-h-screen bg-gray-100 py-8">
      <Toaster position="top-right" />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          <div className="text-sm text-gray-500">
            Total Orders: {displayOrders.filter((order) => order.payment_status === "completed").length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-sm text-left table-auto">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 min-w-[60px]">Image</th>
                <th className="px-4 py-3 min-w-[150px]">Ordered By</th>
                <th className="px-4 py-3 min-w-[120px] hidden sm:table-cell">Phone</th>
                <th className="px-4 py-3 min-w-[100px] hidden md:table-cell">Company</th>
                <th className="px-4 py-3 min-w-[180px]">Products</th>
                <th className="px-4 py-3 min-w-[80px]">Total</th>
                <th className="px-4 py-3 min-w-[140px]">Status</th>
                <th className="px-4 py-3 min-w-[100px] hidden lg:table-cell">Payment</th>
                <th className="px-4 py-3 min-w-[150px] hidden xl:table-cell">Address</th>
                <th className="px-4 py-3 min-w-[100px] hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders
                .filter((order) => order.payment_status === "completed")
                .map((order, index) => (
                  <tr
                    key={order._id}
                    className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-4 py-3">
                      {order.products[0]?.selected_image ? (
                        <img
                          src={order.products[0].selected_image}
                          alt={order.products[0].product_id?.product_name || "Product"}
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
                    <td className="px-4 py-3 whitespace-normal">
                      {order.order_email || (
                        <span className="text-gray-500">No email</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-normal hidden sm:table-cell">
                      {order.phone_number || (
                        <span className="text-gray-500">No phone</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-normal hidden md:table-cell">
                      {order.products[0]?.product_id?.brand_name || (
                        <span className="text-gray-500">No brand</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-normal">
                      {order.products.map((item) => (
                        <div key={item.product_id?._id || item.product_id} className="text-xs">
                          <span className="font-medium">
                            {item.product_id?.product_name || "Unknown Product"}
                          </span>{" "}
                          (x{item.quantity})
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ${order.total_amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status || "pending"}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={statusUpdating[order._id]}
                        className={`border rounded-md px-2 py-1 text-xs font-medium w-full ${getStatusStyles(
                          order.status
                        )} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 capitalize hidden lg:table-cell">
                      {order.payment_status || (
                        <span className="text-gray-500">Unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-normal hidden xl:table-cell">
                      {order.shipping_address || (
                        <span className="text-gray-500">No address</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : <span className="text-gray-500">No date</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {statusUpdating[order._id] && (
                          <PulseLoader size={6} color="#2563eb" />
                        )}
                        {user.role === "superadmin" && (
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            disabled={deleting[order._id]}
                            className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors text-xs"
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