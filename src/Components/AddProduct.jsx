import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ImageUpload from "./ImageUpload";
import { createProduct } from "../store/productSlice";
import Select from "react-select";
import axios from "axios";
import ErrorBoundary from "./ErrorBoundary";

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
    sizes: [],
    warranty: "",
    brand_name: "",
    product_code: "",
    rating: 4,
    bg_color: "#FFFFFF",
    shipping: "0",
    payment: ["Cash on Delivery"],
    isNewArrival: false,
    isBestSeller: false,
  });
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [enableSizes, setEnableSizes] = useState(false);
  const [sizeInputs, setSizeInputs] = useState([{ size: "", stock: "" }]);

  const [customSize, setCustomSize] = useState("");
  const [highlights, setHighlights] = useState([""]);

  const paymentOptions = [
    { value: "Cash on Delivery", label: "Cash on Delivery" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Debit Card", label: "Debit Card" },
    { value: "PayPal", label: "PayPal" },
    { value: "Bank Transfer", label: "Bank Transfer" },
  ];

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
    if (!enableSizes && (isNaN(stock) || stock < 0)) {
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
    const shippingCost = Number(formData.shipping);
    if (isNaN(shippingCost) || shippingCost < 0) {
      setError("Shipping cost must be a non-negative number.");
      toast.error("Shipping cost must be a non-negative number.");
      return;
    }
    if (!formData.payment || formData.payment.length === 0) {
      setError("At least one payment method is required.");
      toast.error("At least one payment method is required.");
      return;
    }
    if (formData.bg_color && !/^#[0-9A-F]{6}$/i.test(formData.bg_color)) {
      setError("Background color must be a valid hex code (e.g., #FFFFFF).");
      toast.error("Background color must be a valid hex code (e.g., #FFFFFF).");
      return;
    }
    if (enableSizes) {
      for (const size of sizeInputs) {
        if (size.size && (isNaN(size.stock) || size.stock < 0)) {
          setError("All sizes must have a valid non-negative stock.");
          toast.error("All sizes must have a valid non-negative stock.");
          return;
        }
      }
    }

    try {
      const sizesToSubmit = enableSizes
        ? sizeInputs.filter((size) => size.size && size.stock !== "")
        : [];
      const highlightsToSubmit = highlights.filter((h) => h.trim() !== "");
      await dispatch(
        createProduct({
          ...formData,
          product_base_price: basePrice,
          product_discounted_price: discountedPrice,
          product_stock: stock,
          sizes: sizesToSubmit,
          highlights: highlightsToSubmit,
          warranty: formData.warranty || "",
          shipping: shippingCost,
          payment: formData.payment,
          isNewArrival: formData.isNewArrival,
          isBestSeller: formData.isBestSeller,
          bg_color: formData.bg_color || "#FFFFFF",
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
        sizes: [],
        highlights: [],
        warranty: "",
        brand_name: "",
        product_code: "",
        rating: 4,
        bg_color: "#FFFFFF",
        shipping: "0",
        payment: ["Cash on Delivery"],
        isNewArrival: false,
        isBestSeller: false,
      });
      setHighlights([""]);
      setSizeInputs([
        { size: "S", stock: "" },
        { size: "M", stock: "" },
        { size: "L", stock: "" },
        { size: "XL", stock: "" },
      ]);
      setEnableSizes(false);
      navigate("/product");
    } catch (err) {
      const errorMessage = err.message || "Failed to create product";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const handlePaymentChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setFormData((prev) => ({ ...prev, payment: values }));
    setError(null);
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...sizeInputs];
    newSizes[index][field] = value;
    setSizeInputs(newSizes);
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
            required={!enableSizes}
            min="0"
            step="1"
            disabled={enableSizes}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={enableSizes}
              onChange={() => setEnableSizes(!enableSizes)}
              className="h-5 w-5 text-blue-600"
            />
            Enable Sizes
          </label>
          {enableSizes && (
            <div className="space-y-3">
              {sizeInputs.map((sizeInput, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Enter Size (e.g., S, M, L, 14, 16, 18)"
                    value={sizeInput.size}
                    onChange={(e) =>
                      handleSizeChange(
                        index,
                        "size",
                        e.target.value.toUpperCase()
                      )
                    }
                    className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={sizeInput.stock}
                    onChange={(e) =>
                      handleSizeChange(index, "stock", e.target.value)
                    }
                    min="0"
                    step="1"
                    className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  {sizeInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newSizes = sizeInputs.filter(
                          (_, i) => i !== index
                        );
                        setSizeInputs(newSizes);
                      }}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setSizeInputs([...sizeInputs, { size: "", stock: "" }])
                }
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                + Add Another Size
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-gray-700 mb-2">
            Warranty (optional)
          </label>
          <input
            type="text"
            name="warranty"
            placeholder="Warranty (e.g., 1 Year)"
            value={formData.warranty}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">
            Shipping Cost (Rs.)
          </label>
          <input
            type="number"
            name="shipping"
            placeholder="Shipping Cost (Rs.)"
            value={formData.shipping}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Payment Methods</label>
          <Select
            isMulti
            name="payment"
            options={paymentOptions}
            classNamePrefix="select"
            styles={customSelectStyles}
            value={paymentOptions.filter((opt) =>
              formData.payment.includes(opt.value)
            )}
            onChange={handlePaymentChange}
            placeholder="Select Payment Methods"
            isLoading={categoryLoading}
            isDisabled={categoryLoading || imageUploading}
          />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              name="isNewArrival"
              checked={formData.isNewArrival}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600"
            />
            New Arrival
          </label>
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              name="isBestSeller"
              checked={formData.isBestSeller}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600"
            />
            Best Seller
          </label>
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
          <ErrorBoundary>
            <ImageUpload
              formFields={formData}
              setFormFields={setFormData}
              fieldName="product_images"
              setImageUploading={setImageUploading}
            />
          </ErrorBoundary>
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
        <div>
          <label className="block text-gray-700 mb-2">Product Highlights</label>
          {highlights.map((highlight, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={highlight}
                onChange={(e) => {
                  const newHighlights = [...highlights];
                  newHighlights[idx] = e.target.value;
                  setHighlights(newHighlights);
                }}
                placeholder="Enter a product highlight"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {highlights.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setHighlights(highlights.filter((_, i) => i !== idx))
                  }
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setHighlights([...highlights, ""])}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Add Another Highlight
          </button>
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
