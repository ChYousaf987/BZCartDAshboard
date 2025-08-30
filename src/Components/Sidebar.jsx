import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("myUser"));

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
    <div className="w-60 bg-gradient-to-b from-blue-50 to-blue-100 p-6 min-h-screen fixed top-0 left-0 flex flex-col justify-between shadow-md">
      <div>
        <div className="flex justify-center mb-6 -mt-5">
          <img
            src="/logos.png"
            alt="Logo"
            className="h-20 w-auto object-contain"
          />
        </div>
        <nav className="flex flex-col justify-between items-center h-[80vh]">
          <div className="flex flex-col gap-4 w-full">
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
              </>
            )}
            {["superadmin", "team"].includes(user?.role) && (
              <Link to="/orders" className={linkClasses("/orders")}>
                🛒 Orders
              </Link>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-3 rounded-lg transition-all duration-300 font-medium text-lg bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 w-full"
          >
            🚪 Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
