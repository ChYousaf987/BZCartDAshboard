import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createSlide,
  fetchSlides,
  updateSlide,
  deleteSlide,
} from "../features/slides/slideSlice";
import { PulseLoader } from "react-spinners";
import Sidebar from "./Sidebar";

const AddSliders = () => {
  const dispatch = useDispatch();
  const { slides, loading, error } = useSelector((state) => state.slides);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    image: null,
    link: "",
    bgColor: "#ffffff", // Default background color (white)
    size: "medium", // Default size
  });
  const [editingSlide, setEditingSlide] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    dispatch(fetchSlides());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: file }));
    if (file && name === "image") {
      setImagePreview(URL.createObjectURL(file));
    } else if (!file && name === "image") {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingSlide && !formData.image) {
      toast.error("Please select a main image");
      return;
    }

    if (editingSlide) {
      dispatch(updateSlide({ id: editingSlide._id, slideData: formData }))
        .unwrap()
        .then(() => {
          toast.success("Slide updated successfully!");
          setFormData({
            title: "",
            subtitle: "",
            buttonText: "",
            image: null,
            link: "",
            bgColor: "#ffffff",
            size: "medium",
          });
          setImagePreview(null);
          setEditingSlide(null);
        })
        .catch((err) => toast.error(err.message || "Failed to update slide"));
    } else {
      dispatch(createSlide(formData))
        .unwrap()
        .then(() => {
          toast.success("Slide created successfully!");
          setFormData({
            title: "",
            subtitle: "",
            buttonText: "",
            image: null,
            link: "",
            bgColor: "#ffffff",
            size: "medium",
          });
          setImagePreview(null);
        })
        .catch((err) => toast.error(err.message || "Failed to create slide"));
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      buttonText: slide.buttonText || "",
      image: null,
      link: slide.link || "",
      bgColor: slide.bgColor || "#ffffff",
      size: slide.size || "medium",
    });
    setImagePreview(slide.image);
  };

  const handleCancelEdit = () => {
    setEditingSlide(null);
    setFormData({
      title: "",
      subtitle: "",
      buttonText: "",
      image: null,
      link: "",
      bgColor: "#ffffff",
      size: "medium",
    });
    setImagePreview(null);
  };

  const handleDelete = (id) => {
    dispatch(deleteSlide(id))
      .unwrap()
      .then(() => {
        toast.success("Slide deleted successfully!");
      })
      .catch((err) => toast.error(err.message || "Failed to delete slide"));
  };

  if (loading && slides.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <PulseLoader size={15} color="#3B82F6" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl">{error}</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-60 p-6 bg-gray-50 min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className="text-3xl font-bold mb-6">
          {editingSlide ? "Edit Slide" : "Add New Slide"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md max-w-2xl"
          encType="multipart/form-data"
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter slide title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Subtitle (optional)
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter slide subtitle"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Button Text (optional)
            </label>
            <input
              type="text"
              name="buttonText"
              value={formData.buttonText}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter button text"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Main Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-lg"
              required={!editingSlide}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Main image preview"
                className="mt-2 w-full max-w-md object-contain rounded-md"
              />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Link (optional)
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter link URL (e.g., /products)"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Background Color
            </label>
            <input
              type="color"
              name="bgColor"
              value={formData.bgColor}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Size</label>
            <select
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingSlide ? "Update Slide" : "Add Slide"}
            </button>
            {editingSlide && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h3 className="text-2xl font-bold mt-8 mb-4">Existing Slides</h3>
        {slides.length === 0 ? (
          <p className="text-gray-600">No slides available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slides.map((slide) => (
              <div
                key={slide._id}
                className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2"
                style={{ backgroundColor: slide.bgColor || "#ffffff" }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full max-w-md object-contain rounded-md"
                />
                <h4 className="font-semibold">{slide.title || "No Title"}</h4>
                <p className="text-gray-600">
                  {slide.subtitle || "No Subtitle"}
                </p>
                <p className="text-gray-600">
                  Button: {slide.buttonText || "No Button Text"}
                </p>
                <p className="text-gray-600">
                  Link: {slide.link || "/products"}
                </p>
                <p className="text-gray-600">Size: {slide.size}</p>
                <p className="text-gray-600">
                  Background Color: {slide.bgColor || "Default (White)"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="bg-yellow-500 text-white px-4 py-1 rounded-lg hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slide._id)}
                    className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSliders;
