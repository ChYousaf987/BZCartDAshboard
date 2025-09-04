import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ImageUpload from "./ImageUpload";
import { createProduct } from "../store/productSlice";
import Select from "react-select";
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
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#e0f2fe",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#2563eb",
  }),
};

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    product_base_price: "",
    product_discounted_price: "",
    product_images: [],
    category: "",
    subcategories: [],
    product_stock: "",
    brand_name: "",
    product_code: "",
    rating: 4,
    bg_color: "#FFFFFF", // Initialize with default color
  });
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);

  // Check user authentication and role
  const user = JSON.parse(localStorage.getItem("myUser") || "{}");
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600">Access Denied</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await axios.get(
          "https://bzbackend.online/api/categories/categories"
        );
        const validCategories = Array.isArray(response.data)
          ? response.data.filter(
              (cat) => !cat.parent_category && cat._id && cat.name
            )
          : [];
        const validSubcategories = Array.isArray(response.data)
          ? response.data.filter(
              (cat) => cat.parent_category && cat._id && cat.name
            )
          : [];
        setCategories(validCategories);
        setSubcategories(validSubcategories);
      } catch (err) {
        toast.error(
          `Failed to fetch categories: ${err.message || "Unknown error"}`
        );
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (categoryLoading) {
      setError("Categories are still loading. Please wait.");
      toast.error("Categories are still loading. Please wait.");
      return;
    }
    if (imageUploading) {
      setError("Images are still uploading. Please wait.");
      toast.error("Images are still uploading. Please wait.");
      return;
    }

    // Validate required fields
    if (!formData.product_name) {
      setError("Product name is required.");
      toast.error("Product name is required.");
      return;
    }
    if (!formData.brand_name) {
      setError("Brand name is required.");
      toast.error("Brand name is required.");
      return;
    }
    if (!formData.product_code) {
      setError("Product code is required.");
      toast.error("Product code is required.");
      return;
    }
    const stock = Number(formData.product_stock);
    if (isNaN(stock) || stock < 0) {
      setError("Stock must be a non-negative number.");
      toast.error("Stock must be a non-negative number.");
      return;
    }
    const basePrice = Number(formData.product_base_price);
    const discountedPrice = Number(formData.product_discounted_price);
    if (isNaN(basePrice) || basePrice <= 0) {
      setError("Base price must be a positive number.");
      toast.error("Base price must be a positive number.");
      return;
    }
    if (isNaN(discountedPrice) || discountedPrice <= 0) {
      setError("Discounted price must be a positive number.");
      toast.error("Discounted price must be a positive number.");
      return;
    }
    if (discountedPrice > basePrice) {
      setError("Discounted price cannot be higher than base price.");
      toast.error("Discounted price cannot be higher than base price.");
      return;
    }
    if (
      !formData.category ||
      !categories.find((cat) => cat._id === formData.category)
    ) {
      setError("Please select a valid category.");
      toast.error("Please select a valid category.");
      return;
    }
    // Validate bg_color
    if (formData.bg_color && !/^#[0-9A-F]{6}$/i.test(formData.bg_color)) {
      setError("Background color must be a valid hex code (e.g., #FFFFFF).");
      toast.error("Background color must be a valid hex code (e.g., #FFFFFF).");
      return;
    }

    try {
      await dispatch(
        createProduct({
          ...formData,
          product_base_price: basePrice,
          product_discounted_price: discountedPrice,
          product_stock: stock,
          bg_color: formData.bg_color || "#FFFFFF", // Ensure bg_color is sent
        })
      ).unwrap();
      toast.success("Product created successfully!");
      setFormData({
        product_name: "",
        product_description: "",
        product_base_price: "",
        product_discounted_price: "",
        product_images: [],
        category: "",
        subcategories: [],
        product_stock: "",
        brand_name: "",
        product_code: "",
        rating: 4,
        bg_color: "#FFFFFF",
      });
      navigate("/product");
    } catch (err) {
      const errorMessage = err.message || "Failed to create product";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      category: selectedOption ? selectedOption.value : "",
      subcategories: [],
    }));
    setError(null);
  };

  const handleSubcategoryChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setFormData((prev) => ({ ...prev, subcategories: values }));
    setError(null);
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  const subcategoryOptions = subcategories
    .filter(
      (subcat) =>
        subcat.parent_category?._id === formData.category ||
        subcat.parent_category === formData.category
    )
    .map((subcat) => ({
      value: subcat._id,
      label: subcat.name,
    }));

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 flex items-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
          </svg>
          Loading categories...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Add New Product</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-700 mb-2">Product Name</label>
          <input
            type="text"
            name="product_name"
            placeholder="Product Title"
            value={formData.product_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Brand Name</label>
          <input
            type="text"
            name="brand_name"
            placeholder="Brand Name"
            value={formData.brand_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Product Code</label>
          <input
            type="text"
            name="product_code"
            placeholder="Product Code"
            value={formData.product_code}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Base Price (Rs.)</label>
          <input
            type="number"
            name="product_base_price"
            placeholder="Base Price (Rs.)"
            value={formData.product_base_price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">
            Discounted Price (Rs.)
          </label>
          <input
            type="number"
            name="product_discounted_price"
            placeholder="Discounted Price (Rs.)"
            value={formData.product_discounted_price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Stock Quantity</label>
          <input
            type="number"
            name="product_stock"
            placeholder="Stock Quantity"
            value={formData.product_stock}
            onChange={handleChange}
            required
            min="0"
            step="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Category</label>
          <Select
            name="category"
            options={categoryOptions}
            classNamePrefix="select"
            styles={customSelectStyles}
            value={categoryOptions.find(
              (opt) => opt.value === formData.category
            )}
            onChange={handleCategoryChange}
            isClearable
            placeholder="Select Category"
            isLoading={categoryLoading}
            isDisabled={categoryLoading || imageUploading}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">
            Subcategories (optional)
          </label>
          <Select
            isMulti
            name="subcategories"
            options={subcategoryOptions}
            classNamePrefix="select"
            styles={customSelectStyles}
            value={subcategoryOptions.filter((opt) =>
              formData.subcategories.includes(opt.value)
            )}
            onChange={handleSubcategoryChange}
            isDisabled={!formData.category || categoryLoading || imageUploading}
            placeholder="Select Subcategories"
            isLoading={categoryLoading}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Images (optional)</label>
          <ImageUpload
            formFields={formData}
            setFormFields={setFormData}
            setImageUploading={setImageUploading}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">
            Background Color (optional)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              name="bg_color"
              value={formData.bg_color}
              onChange={handleChange}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              name="bg_color"
              placeholder="#FFFFFF"
              value={formData.bg_color}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">
            Product Description
          </label>
          <textarea
            name="product_description"
            placeholder="Product Description"
            value={formData.product_description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={categoryLoading || imageUploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {categoryLoading || imageUploading ? "Processing..." : "Add Product"}
        </button>
      </form>
      <Toaster position="top-right" autoClose={3000} />
    </div>
  );
};

export default AddProduct;
