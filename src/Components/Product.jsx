import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, deleteProduct } from "../store/productSlice";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import { PulseLoader } from "react-spinners";
import axios from "axios";

const customSelectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: "0.5rem",
    padding: "0.1rem 0.2rem",
    borderColor: "#cbd5e0",
    boxShadow: "none",
    "&:hover": { borderColor: "#3b82f6" },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#2563eb",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.5rem",
    marginTop: 2,
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? "#3b82f6" : isFocused ? "#e2e8f0" : "white",
    color: isSelected ? "white" : "#1f2937",
    "&:active": { backgroundColor: "#2563eb" },
  }),
};

const Product = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector((state) => state.products);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({
    value: "all",
    label: "All Categories",
  });
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Check user authentication and role
  const user = JSON.parse(localStorage.getItem("myUser"));
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 text-lg font-medium">
          Access Denied: Admin privileges required
        </p>
      </div>
    );
  }

  useEffect(() => {
    // Fetch categories
    setCategoryLoading(true);
    axios
      .get("http://72.60.104.192:3003/api/categories/categories")
      .then((response) => {
        const validCategories = Array.isArray(response.data)
          ? response.data.filter(
              (cat) => !cat.parent_category && cat._id && cat.name
            )
          : [];
        setCategories([
          { value: "all", label: "All Categories" },
          ...validCategories.map((cat) => ({
            value: cat._id,
            label: cat.name,
          })),
        ]);
        setCategoryLoading(false);
      })
      .catch((err) => {
        toast.error(
          "Failed to fetch categories: " + (err.message || "Unknown error")
        );
        setCategoryLoading(false);
      });

    // Fetch products
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id))
        .unwrap()
        .then(() => {
          toast.success("Product deleted successfully!");
        })
        .catch((err) => {
          toast.error(err || "Failed to delete product");
        });
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`);
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(
      selectedOption || { value: "all", label: "All Categories" }
    );
  };

  const clearFilter = () => {
    setSelectedCategory({ value: "all", label: "All Categories" });
  };

  const filteredProducts =
    selectedCategory.value === "all"
      ? products
      : products.filter((item) => {
          // Handle populated and non-populated category fields
          const categoryId = item.category?._id
            ? item.category._id.toString()
            : item.category?.toString();
          const subcategoryIds = Array.isArray(item.subcategories)
            ? item.subcategories.map((subcat) =>
                subcat._id ? subcat._id.toString() : subcat.toString()
              )
            : [];
          return (
            categoryId === selectedCategory.value ||
            subcategoryIds.includes(selectedCategory.value)
          );
        });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
          <button
            onClick={() => navigate("/add-product")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add New Product
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="w-full sm:w-1/3">
            <label className="block text-gray-700 mb-2 font-medium">
              Filter by Category
            </label>
            <Select
              options={categories}
              classNamePrefix="select"
              styles={customSelectStyles}
              value={selectedCategory}
              onChange={handleCategoryChange}
              placeholder="Select a category..."
              isLoading={categoryLoading}
              isClearable
            />
          </div>
          <button
            onClick={clearFilter}
            className="mt-8 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            Clear Filter
          </button>
        </div>

        {categoryLoading || loading ? (
          <div className="flex justify-center items-center h-64">
            <PulseLoader color="#4f46e5" size={15} />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 text-lg">Error: {error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-600 text-lg py-12">
            No products found for the selected category
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {filteredProducts.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
              >
                <div className="h-48 w-full border rounded-t-xl overflow-hidden relative">
                  <img
                    src={
                      item.product_images?.[0] ||
                      "https://via.placeholder.com/150"
                    }
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                  {item.product_stock <= 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
                    {item.product_name}
                  </h2>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {item.product_description || "No description available"}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-500">Price:</span>
                    <del className="text-gray-400">
                      Rs. {item.product_base_price}
                    </del>
                    <span className="text-blue-600 font-semibold">
                      Rs. {item.product_discounted_price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-500">Stock:</span>
                    <span
                      className={`font-semibold ${
                        item.product_stock <= 5
                          ? "text-red-600"
                          : "text-gray-800"
                      }`}
                    >
                      {item.product_stock} units
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-500">Category:</span>
                    <span className="text-gray-800">
                      {item.category?.name || "N/A"}
                    </span>
                  </div>
                  {item.subcategories?.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gray-500">Subcategories:</span>
                      <span className="text-gray-800">
                        {item.subcategories
                          .map((sub) => sub.name || "N/A")
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(item._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
