import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDealById, updateDeal } from "../store/dealSlice";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
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

const EditDeal = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentDeal, loading, error } = useSelector((state) => state.deals);
  const [formData, setFormData] = useState({
    deal_name: "",
    deal_description: "",
    original_price: "",
    deal_price: "",
    deal_stock: "",
    deal_images: [],
    category: "",
    deal_code: "",
    deal_expiry: "",
    bg_color: "#FFFFFF",
  });
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    dispatch(fetchDealById(id));
  }, [dispatch, id]);

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
        setCategories(validCategories);
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

  useEffect(() => {
    if (currentDeal) {
      setFormData({
        deal_name: currentDeal.deal_name || "",
        deal_description: currentDeal.deal_description || "",
        original_price: currentDeal.original_price || "",
        deal_price: currentDeal.deal_price || "",
        deal_stock: currentDeal.deal_stock || "",
        deal_images: currentDeal.deal_images || [],
        category: currentDeal.category?._id || "",
        deal_code: currentDeal.deal_code || "",
        deal_expiry: currentDeal.deal_expiry
          ? new Date(currentDeal.deal_expiry).toISOString().split("T")[0]
          : "",
        bg_color: currentDeal.bg_color || "#FFFFFF",
      });
    }
  }, [currentDeal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormError(null);
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData({
      ...formData,
      category: selectedOption ? selectedOption.value : "",
    });
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (categoryLoading) {
      setFormError("Categories are still loading. Please wait.");
      toast.error("Categories are still loading. Please wait.");
      return;
    }
    if (imageUploading) {
      setFormError("Images are still uploading. Please wait.");
      toast.error("Images are still uploading. Please wait.");
      return;
    }

    if (!formData.deal_name) {
      setFormError("Deal name is required.");
      toast.error("Deal name is required.");
      return;
    }
    if (!formData.deal_code) {
      setFormError("Deal code is required.");
      toast.error("Deal code is required.");
      return;
    }
    if (!formData.deal_expiry) {
      setFormError("Deal expiry is required.");
      toast.error("Deal expiry is required.");
      return;
    }
    const originalPrice = Number(formData.original_price);
    const dealPrice = Number(formData.deal_price);
    if (isNaN(originalPrice) || originalPrice <= 0) {
      setFormError("Original price must be a positive number.");
      toast.error("Original price must be a positive number.");
      return;
    }
    if (isNaN(dealPrice) || dealPrice <= 0) {
      setFormError("Deal price must be a positive number.");
      toast.error("Deal price must be a positive number.");
      return;
    }
    if (dealPrice > originalPrice) {
      setFormError("Deal price cannot be higher than original price.");
      toast.error("Deal price cannot be higher than original price.");
      return;
    }
    if (
      !formData.category ||
      !categories.find((cat) => cat._id === formData.category)
    ) {
      setFormError("Please select a valid category.");
      toast.error("Please select a valid category.");
      return;
    }
    if (!formData.deal_images || formData.deal_images.length === 0) {
      setFormError("At least one deal image is required.");
      toast.error("At least one deal image is required.");
      return;
    }
    if (formData.bg_color && !/^#[0-9A-F]{6}$/i.test(formData.bg_color)) {
      setFormError(
        "Background color must be a valid hex code (e.g., #FFFFFF)."
      );
      toast.error("Background color must be a valid hex code (e.g., #FFFFFF).");
      return;
    }

    try {
      const dealData = {
        ...formData,
        original_price: originalPrice,
        deal_price: dealPrice,
        deal_stock: Number(formData.deal_stock) || 0,
        deal_expiry: new Date(formData.deal_expiry).toISOString(),
      };
      const result = await dispatch(
        updateDeal({ id, formData: dealData })
      ).unwrap();
      console.log("EditDeal - Success:", result);
      toast.success("Deal updated successfully!");
      navigate("/deals");
    } catch (err) {
      console.error("EditDeal - Error:", err);
      const errorMessage = err.message || "Failed to update deal";
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-red-600 p-6">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Deal</h1>
      {formError && <div className="text-red-600 mb-4">{formError}</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 mb-2">Deal Name</label>
          <input
            type="text"
            name="deal_name"
            value={formData.deal_name}
            onChange={handleChange}
            placeholder="Deal Name"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            name="deal_description"
            value={formData.deal_description}
            onChange={handleChange}
            placeholder="Deal Description"
            className="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Original Price</label>
          <input
            type="number"
            name="original_price"
            value={formData.original_price}
            onChange={handleChange}
            placeholder="Original Price"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Deal Price</label>
          <input
            type="number"
            name="deal_price"
            value={formData.deal_price}
            onChange={handleChange}
            placeholder="Deal Price"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Stock</label>
          <input
            type="number"
            name="deal_stock"
            value={formData.deal_stock}
            onChange={handleChange}
            placeholder="Stock Quantity"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="1"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Images</label>
          <ImageUpload
            formFields={formData}
            setFormFields={setFormData}
            setImageUploading={setImageUploading}
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
          <label className="block text-gray-700 mb-2">Deal Code</label>
          <input
            type="text"
            name="deal_code"
            value={formData.deal_code}
            onChange={handleChange}
            placeholder="Deal Code"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Deal Expiry</label>
          <input
            type="date"
            name="deal_expiry"
            value={formData.deal_expiry}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Background Color</label>
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
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || imageUploading}
        >
          {loading || imageUploading ? "Updating..." : "Update Deal"}
        </button>
      </form>
    </div>
  );
};

export default EditDeal;
