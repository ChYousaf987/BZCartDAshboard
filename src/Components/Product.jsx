import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, deleteProduct } from "../store/productSlice";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import { PulseLoader } from "react-spinners";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
    setCategoryLoading(true);
    axios
      .get("https://bzbackend.online/api/categories/categories")
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

  const handleView = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
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

  // Metrics calculations
  const totalProducts = products.length;
  const outOfStockCount = products.filter((item) =>
    !item.sizes || item.sizes.length === 0
      ? item.product_stock <= 0
      : item.sizes.every((size) => size.stock <= 0)
  ).length;
  const newArrivalsCount = products.filter((item) => item.isNewArrival).length;
  const bestSellersCount = products.filter((item) => item.isBestSeller).length;

  // Data for pie chart (products by category)
  const categoryData = categories
    .filter((cat) => cat.value !== "all")
    .map((cat) => ({
      name: cat.label,
      value: products.filter((item) => item.category?.name === cat.label)
        .length,
    }))
    .filter((item) => item.value > 0);

  // Data for bar chart (stock levels)
  const stockData = products.slice(0, 10).map((item) => ({
    name:
      item.product_name.length > 15
        ? item.product_name.substring(0, 15) + "..."
        : item.product_name,
    stock:
      !item.sizes || item.sizes.length === 0
        ? item.product_stock
        : item.sizes.reduce((total, size) => total + size.stock, 0),
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
          <button
            onClick={() => navigate("/add-product")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add New Product
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Products
            </h3>
            <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-gray-700">
              Out of Stock
            </h3>
            <p className="text-3xl font-bold text-red-600">{outOfStockCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700">
              New Arrivals
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {newArrivalsCount}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-gray-700">
              Best Sellers
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {bestSellersCount}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Products by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Stock Levels (Top 10)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
                style={{ backgroundColor: item.bg_color || "#FFFFFF" }}
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
                  {(!item.sizes || item.sizes.length === 0
                    ? item.product_stock <= 0
                    : item.sizes.every((size) => size.stock <= 0)) && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                  {item.isNewArrival && (
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      New Arrival
                    </span>
                  )}
                  {item.isBestSeller && (
                    <span className="absolute top-10 left-2 bg-yellow-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Best Seller
                    </span>
                  )}
                </div>
                <div className="p-6 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-b-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 line-clamp-1 leading-tight">
                    {item.product_name}
                  </h2>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        <span className="text-gray-600 text-sm font-medium">
                          Price
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 line-through">
                          Rs. {item.product_price}
                        </span>
                        <span className="text-2xl font-extrabold text-blue-600">
                          Rs. {item.product_discounted_price}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-600 text-sm font-medium">
                          Stock
                        </span>
                      </div>
                      <span
                        className={`font-semibold text-sm px-2 py-1 rounded-full ${
                          (
                            !item.sizes || item.sizes.length === 0
                              ? item.product_stock <= 5
                              : item.sizes.every((size) => size.stock <= 5)
                          )
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {(!item.sizes || item.sizes.length === 0
                          ? item.product_stock
                          : item.sizes.reduce(
                              (total, size) => total + size.stock,
                              0
                            )) > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() => handleView(item)}
                      className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                      title="View Product"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(item._id)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                      title="Edit Product"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                      title="Delete Product"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product View Modal */}
        {isModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Product Details
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Product Images */}
                  <div className="space-y-4">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={
                          selectedProduct.product_images?.[0] ||
                          "https://via.placeholder.com/400"
                        }
                        alt={selectedProduct.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedProduct.product_images?.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedProduct.product_images
                          .slice(1)
                          .map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`${selectedProduct.product_name} ${
                                index + 2
                              }`}
                              className="aspect-square rounded-lg object-cover cursor-pointer hover:opacity-80"
                            />
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Product Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedProduct.product_name}
                      </h3>
                      <p className="text-gray-600">
                        {selectedProduct.product_description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Category
                        </span>
                        <p className="text-gray-900">
                          {selectedProduct.category?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Subcategories
                        </span>
                        <p className="text-gray-900">
                          {selectedProduct.subcategories
                            ?.map((sub) => sub.name)
                            .join(", ") || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Price
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-lg text-gray-500 line-through">
                          Rs. {selectedProduct.product_price}
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          Rs. {selectedProduct.product_discounted_price}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Stock Information
                      </span>
                      {selectedProduct.sizes &&
                      selectedProduct.sizes.length > 0 ? (
                        <div className="mt-2 space-y-2">
                          {selectedProduct.sizes.map((size, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm text-gray-700">
                                Size: {size.size}
                              </span>
                              <span
                                className={`text-sm px-2 py-1 rounded-full ${
                                  size.stock > 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {size.stock} in stock
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p
                          className={`text-sm mt-2 px-2 py-1 rounded-full inline-block ${
                            selectedProduct.product_stock > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {selectedProduct.product_stock} in stock
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.isNewArrival && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          New Arrival
                        </span>
                      )}
                      {selectedProduct.isBestSeller && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Best Seller
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          handleEdit(selectedProduct._id);
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Edit Product
                      </button>
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          handleDelete(selectedProduct._id);
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Delete Product
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
