import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { PulseLoader } from "react-spinners";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    parent_category: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("myUser"));

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://bzbackend.online/api/categories/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Fetch categories error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(
          `https://bzbackend.online/api/categories/category/${editingCategory._id}`,
          formData
        );
        toast.success("Category updated successfully!");
      } else {
        await axios.post(
          `https://bzbackend.online/api/categories/create-category`,
          formData
        );
        toast.success("Category created successfully!");
      }
      setFormData({ name: "", parent_category: "" });
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error("Save category error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parent_category: category.parent_category?._id || "",
    });
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(
          `https://bzbackend.online/api/categories/category/${categoryId}`
        );
        toast.success("Category deleted successfully!");
        fetchCategories();
      } catch (err) {
        console.error("Delete category error:", err.response?.data || err.message);
        toast.error(err.response?.data?.message || "Failed to delete category");
      }
    }
  };

  // Check user authentication and role
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg font-medium">
          Access Denied: Admin privileges required
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <PulseLoader color="#2563eb" size={15} />
      </div>
    );
  }

  const parentCategories = categories.filter((cat) => !cat.parent_category);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Manage Categories
        </h2>
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Category Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter category name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Parent Category (optional)
              </label>
              <select
                value={formData.parent_category}
                onChange={(e) =>
                  setFormData({ ...formData, parent_category: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">None (Top-level Category)</option>
                {parentCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              {editingCategory ? "Update Category" : "Add Category"}
            </button>
          </form>
          {editingCategory && (
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: "", parent_category: "" });
              }}
              className="w-full mt-2 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Category List</h3>
          {categories.length === 0 ? (
            <p className="text-gray-600">No categories found.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((category) => (
                <li
                  key={category._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span>
                    {category.name}{" "}
                    {category.parent_category && (
                      <span className="text-gray-500">
                        (Subcategory of {category.parent_category.name})
                      </span>
                    )}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;