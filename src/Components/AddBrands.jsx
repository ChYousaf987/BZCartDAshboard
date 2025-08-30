import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBrand } from "../features/brands/brandSlice";
import ImageUpload from "./ImageUpload";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";

const AddBrands = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.brands || {});
  const [formFields, setFormFields] = useState({ brand_image: [] });

  // Log formFields changes for debugging
  useEffect(() => {
    console.log("Current formFields state:", formFields);
  }, [formFields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked, formFields:", formFields);
    if (!formFields.brand_image.length) {
      toast.error("Please upload at least one brand image");
      return;
    }

    try {
      // Save each image URL to the backend
      for (const image of formFields.brand_image) {
        console.log("Dispatching addBrand with image:", image);
        await dispatch(addBrand({ image })).unwrap();
      }
      toast.success("Brand(s) added successfully!");
      setFormFields({ brand_image: [] });
    } catch (err) {
      console.error("Error adding brand:", err);
      toast.error("Failed to add brand: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Brand</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUpload
          formFields={formFields}
          setFormFields={(newFields) => {
            console.log("ImageUpload updating formFields:", newFields);
            setFormFields({
              brand_image: newFields.product_images || [],
            });
          }}
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition disabled:bg-blue-300"
        >
          {loading ? <PulseLoader size={8} color="#ffffff" /> : "Add Brand"}
        </button>
      </form>
    </div>
  );
};

export default AddBrands;