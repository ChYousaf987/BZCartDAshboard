import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("myUser"));
  const { orders, newOrders } = useSelector((state) => state.orders);

  // Calculate total unique orders with completed payment status
  const totalOrdersCount = useMemo(() => {
    const allOrders = [...newOrders, ...orders];
    const uniqueOrders = allOrders.filter(
      (order, index, self) =>
        order.payment_status === "completed" &&
        index === self.findIndex((o) => o._id === order._id)
    );
    return uniqueOrders.length;
  }, [orders, newOrders]);

  const linkClasses = (path) =>
    `px-4 py-3 rounded-lg transition-all duration-300 font-medium text-lg ${
      location.pathname === path
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("myUser");
    navigate("/login");
  };

  return (
    <div className="w-60 bg-gradient-to-b from-blue-50 to-blue-100 p-4 min-h-screen fixed top-0 left-0 flex flex-col justify-between shadow-md">
      <div>
        <div className="flex justify-center mb-6 -mt-4">
          <img
            src="/logg.png"
            alt="Logo"
            className="h-20 w-auto object-contain"
          />
        </div>
        <nav className="flex flex-col justify-between items-center h-[80vh]">
          <div className="flex flex-col gap-1 w-full">
            <Link to="/product" className={linkClasses("/product")}>
              📦 Product
            </Link>
            {["superadmin", "admin"].includes(user?.role) && (
              <>
                <Link to="/add-product" className={linkClasses("/add-product")}>
                  ➕ Add Product
                </Link>
                <Link to="/add-slider" className={linkClasses("/add-slider")}>
                  🖼️ Add Slider
                </Link>
                <Link
                  to="/manage-categories"
                  className={linkClasses("/manage-categories")}
                >
                  🗂️ Manage Categories
                </Link>
                <Link to="/reels" className={linkClasses("/reels")}>
                  📽 Reels
                </Link>
                <Link to="/AllUser" className={linkClasses("/AllUser")}>
                  👤 All User
                </Link>
                <Link to="/deals" className={linkClasses("/deals")}>
                  🎉 Deals
                </Link>
              </>
            )}
            {["superadmin", "team"].includes(user?.role) && (
              <div className="relative">
                <Link to="/orders" className={linkClasses("/orders")}>
                  🛒 Orders ({totalOrdersCount})
                </Link>
                {newOrders.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {newOrders.length}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-3 rounded-lg transition-all duration-300 font-medium text-lg bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 w-full mt-4"
          >
            🚪 Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;