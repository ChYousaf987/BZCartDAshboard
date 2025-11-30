import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem("myUser")) || null;
  const { orders, newOrders } = useSelector((state) => state.orders);
  // count only completed orders
  const orderCount = Array.isArray(orders)
    ? orders.filter((order) => order.payment_status === "completed").length
    : 0;
  const newOrderCount = Array.isArray(newOrders) ? newOrders.length : 0;
  const navigate = useNavigate();

  const navItems = [
    {
      path: "/product",
      label: "Dashboard",
      roles: ["superadmin", "admin"],
    },
    {
      path: "/orders",
      label: "Orders",
      roles: ["superadmin", "team"],
    },
    {
      path: "/completed-orders",
      label: "Completed Orders",
      roles: ["superadmin", "team"],
    },
    {
      path: "/add-product",
      label: "Add Product",
      roles: ["superadmin", "admin"],
    },
    {
      path: "/add-slider",
      label: "Add Slider",
      roles: ["superadmin", "admin"],
    },
    { path: "/AllUser", label: "Users", roles: ["superadmin"] },
    {
      path: "/manage-categories",
      label: "Categories",
      roles: ["superadmin", "admin"],
    },
    { path: "/deals", label: "Deals", roles: ["superadmin"] },
    { path: "/add-deal", label: "Add Deal", roles: ["superadmin"] },
    { path: "/campaigns", label: "Campaigns", roles: ["superadmin"] },
    {
      path: "/activity",
      label: "Activity",
      roles: ["superadmin", "admin", "team"],
    },
  ];

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem("myUser");
    navigate("/login");
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-60 !bg-dark bg-opacity-100 text-white font-daraz shadow-xl z-50 overflow-hidden border-r-4 border-gradient-to-b from-primary to-dark transition-all hover:shadow-2xl animate-fadeIn">
      <div className="p-6 flex flex-col h-full justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-primary">
            BZCart Dashboard
          </h2>
          <div className="mb-8 text-sm">
            <span className="bg-gray-800 text-primary font-bold px-3 py-1 rounded-full">
              Total Orders: {orderCount}
            </span>
          </div>
          <nav className="space-y-2">
            {navItems.map(
              (item) =>
                user &&
                item.roles.includes(user.role) && (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 p-3 rounded-md transition-all duration-300 !text-white ${
                        isActive
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-accent hover:bg-opacity-80 hover:shadow-lg"
                      }`
                    }
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
                        d={
                          item.label === "Dashboard"
                            ? "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            : item.label === "Orders"
                            ? "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            : item.label === "Add Product"
                            ? "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            : item.label === "Users" ||
                              item.label === "Pending Users"
                            ? "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            : item.label === "Add Slider" ||
                              item.label === "Categories"
                            ? "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
                            : item.label === "Deals" ||
                              item.label === "Add Deal"
                            ? "M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
                            : "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
                        }
                      />
                    </svg>
                    <span className="text-sm">
                      {item.label}
                      {item.label === "Orders" && newOrderCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {newOrderCount}
                        </span>
                      )}
                    </span>
                  </NavLink>
                )
            )}
          </nav>
        </div>

        {/* Logout Button */}
        {user && (
          <button
            onClick={handleLogout}
            className="mt-6 w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300"
          >
            Logout
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
