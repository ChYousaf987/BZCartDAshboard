import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById, updateProduct } from "../store/productSlice";
import toast, { Toaster } from "react-hot-toast";
import ImageUpload from "./ImageUpload";
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

const EditProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    product,
    loading,
    error: apiError,
  } = useSelector((state) => state.products);
  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [enableSizes, setEnableSizes] = useState(false);
  const [sizeInputs, setSizeInputs] = useState([
    { size: "S", stock: "" },
    { size: "M", stock: "" },
    { size: "L", stock: "" },
    { size: "XL", stock: "" },
  ]);

  const [customSize, setCustomSize] = useState("");

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
        <p className="text-red-600 text-lg font-medium">
          Access Denied: Admin privileges required
        </p>
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

    dispatch(fetchProductById(id));
    fetchCategories();
  }, [dispatch, id]);

  useEffect(() => {
    if (product && product._id === id && !formData) {
      const productSizes = Array.isArray(product.sizes)
        ? [
            { size: "S", stock: "" },
            { size: "M", stock: "" },
            { size: "L", stock: "" },
            { size: "XL", stock: "" },
          ].map((defaultSize) => {
            const existingSize = product.sizes.find(
              (s) => s.size === defaultSize.size
            );
            return existingSize
              ? {
                  size: existingSize.size,
                  stock: existingSize.stock.toString(),
                }
              : defaultSize;
          })
        : [
            { size: "S", stock: "" },
            { size: "M", stock: "" },
            { size: "L", stock: "" },
            { size: "XL", stock: "" },
          ];
      setFormData({
        product_name: product.product_name || "",
        product_description: product.product_description || "",
        product_base_price: product.product_base_price?.toString() || "",
        product_discounted_price:
          product.product_discounted_price?.toString() || "",
        product_images: product.product_images || [],
        category: product.category?._id || product.category || "",
        subcategories: Array.isArray(product.subcategories)
          ? product.subcategories.map((sub) => sub._id || sub)
          : [],
        product_stock: product.product_stock?.toString() || "",
        sizes: productSizes,
        warranty: product.warranty || "",
        brand_name: product.brand_name || "",
        product_code: product.product_code || "",
        rating: product.rating || 4,
        bg_color: product.bg_color || "#FFFFFF",
        shipping: product.shipping?.toString() || "0",
        payment: product.payment || ["Cash on Delivery"],
        isNewArrival: product.isNewArrival || false,
        isBestSeller: product.isBestSeller || false,
      });
      setSizeInputs(productSizes);
      setEnableSizes(product.sizes && product.sizes.length > 0);
    }
  }, [product, id, formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) {
      setError("Product data is still loading.");
      toast.error("Product data is still loading.");
      return;
    }

    if (imageUploading) {
      setError("Images are still uploading. Please wait.");
      toast.error("Images are still uploading. Please wait.");
      return;
    }

    setError(null);

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
    if (isNaN(basePrice) || basePrice <= 0) {
      setError("Base price must be a positive number.");
      toast.error("Base price must be a positive number.");
      return;
    }
    const discountedPrice = Number(formData.product_discounted_price);
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
      setError("Category is not defined.");
      toast.error("Category is not defined.");
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
      await dispatch(
        updateProduct({
          id,
          productData: {
            ...formData,
            product_base_price: basePrice,
            product_discounted_price: discountedPrice,
            product_stock: stock,
            sizes: sizesToSubmit,
            warranty: formData.warranty || "",
            shipping: shippingCost,
            payment: formData.payment,
            isNewArrival: formData.isNewArrival,
            isBestSeller: formData.isBestSeller,
            bg_color: formData.bg_color || "#FFFFFF",
          },
        })
      ).unwrap();
      toast.success("Product updated successfully!");
      navigate("/product");
    } catch (err) {
      const errorMessage = err || "Failed to update product";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setError(null);
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData({
      ...formData,
      category: selectedOption ? selectedOption.value : "",
      subcategories: [],
    });
    setError(null);
  };

  const handleSubcategoryChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setFormData({ ...formData, subcategories: values });
    setError(null);
  };

  const handlePaymentChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setFormData({ ...formData, payment: values });
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
        subcat.parent_category?._id === formData?.category ||
        subcat.parent_category === formData?.category
    )
    .map((subcat) => ({
      value: subcat._id,
      label: subcat.name,
    }));

  if (loading || categoryLoading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-600 text-lg">Error: {apiError}</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg max-w-2xl mx-auto my-12">
      <Toaster position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Edit Product</h2>
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
                </div>
              ))}
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
          <label className="block text-gray-700 mb-2">Images</label>
          <ImageUpload
            formFields={formData}
            setFormFields={setFormData}
            fieldName="product_images"
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
          />
        </div>
        <button
          type="submit"
          disabled={loading || imageUploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || imageUploading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
