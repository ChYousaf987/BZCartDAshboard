import React from "react";
import { CiSearch } from "react-icons/ci";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((state) => state.users);

  return (
    <div className="flex h-16 w-full justify-between items-center bg-white p-4 shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1 bg-gray-50">
          <CiSearch className="text-xl text-gray-500" />
          <input
            className="outline-none flex-1 bg-transparent pl-2 text-gray-600"
            type="text"
            placeholder="Search products..."
          />
        </div>
        <div className="flex items-center gap-3">
          <img
            src="https://t4.ftcdn.net/jpg/02/44/43/69/360_F_244436923_vkMe10KKKiw5bjhZeRDT05moxWcPpdmb.jpg"
            alt="admin"
            className="h-10 w-10 rounded-full border border-gray-200"
          />
          <div>
            <h2 className="font-semibold text-gray-800">
              {user ? user.username || user.email : "Guest"}
            </h2>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
