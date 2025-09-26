import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem("myUser")) || null;

  const navItems = [
    { path: "/product", label: "Dashboard", roles: ["superadmin", "admin", "team"] },
    { path: "/orders", label: "Orders", roles: ["superadmin", "admin", "team"] },
    { path: "/add-product", label: "Add Product", roles: ["superadmin", "admin"] },
    { path: "/add-slider", label: "Add Slider", roles: ["superadmin", "admin"] },
    { path: "/pending-users", label: "Pending Users", roles: ["superadmin"] },
    { path: "/AllUser", label: "Users", roles: ["superadmin"] },
    { path: "/manage-categories", label: "Categories", roles: ["superadmin", "admin"] },
    { path: "/deals", label: "Deals", roles: ["superadmin", "admin"] },
    { path: "/add-deal", label: "Add Deal", roles: ["superadmin", "admin"] },
    { path: "/messages", label: "Messages", roles: ["superadmin"] },
    { path: "/reports", label: "Reports", roles: ["superadmin"] },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-60 !bg-dark bg-opacity-100 text-white font-daraz shadow-xl z-50 overflow-hidden border-r-4 border-gradient-to-b from-primary to-dark transition-all hover:shadow-2xl animate-fadeIn">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-8 text-primary">BZCart Dashboard</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            user && item.roles.includes(user.role) && (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-3 rounded-md transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "hover:bg-accent hover:bg-opacity-80 hover:text-white hover:shadow-lg"
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
                        : item.label === "Users" || item.label === "Pending Users"
                        ? "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        : item.label === "Add Slider" || item.label === "Categories"
                        ? "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
                        : item.label === "Deals" || item.label === "Add Deal"
                        ? "M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
                        : item.label === "Messages"
                        ? "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        : item.label === "Reports"
                        ? "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        : "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
                    }
                  />
                </svg>
                <span className="text-sm">{item.label}</span>
              </NavLink>
            )
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;