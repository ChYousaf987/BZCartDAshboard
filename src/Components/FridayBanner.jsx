import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const FridayBanner = () => {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [timer, setTimer] = useState("");
  const [existingBanner, setExistingBanner] = useState(null);

  // Directly set your backend API URL
  const API = "http://localhost:3003/api/friday-banner";

  const fetchBanner = async () => {
    try {
      const { data } = await axios.get(API);
      setExistingBanner(data);
    } catch {
      toast.error("Failed to load banner");
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  const uploadBanner = async (e) => {
    e.preventDefault();

    if (!image && !video) {
      toast.error("Image or Video required!");
      return;
    }

    const form = new FormData();
    if (image) form.append("image", image);
    if (video) form.append("video", video);
    form.append("title", title);
    form.append("buttonText", buttonText);
    form.append("buttonLink", buttonLink);
    form.append("timer", timer);

    try {
      await axios.post(API, form);
      toast.success("Friday Banner Added");
      fetchBanner();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  const deleteBanner = async () => {
    try {
      await axios.delete(`${API}/${existingBanner._id}`);
      toast.success("Banner deleted");
      setExistingBanner(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-semibold mb-4">Friday Banner</h2>

      {/* Upload Form */}
      <form onSubmit={uploadBanner} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
        />

        <input
          type="text"
          placeholder="Title (optional)"
          className="p-2 border rounded w-full"
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Button Text (optional)"
          className="p-2 border rounded w-full"
          onChange={(e) => setButtonText(e.target.value)}
        />

        <input
          type="text"
          placeholder="Button Link (optional)"
          className="p-2 border rounded w-full"
          onChange={(e) => setButtonLink(e.target.value)}
        />

        <input
          type="datetime-local"
          className="p-2 border rounded w-full"
          onChange={(e) => setTimer(e.target.value)}
        />

        <button className="bg-blue-600 text-white py-2 px-5 rounded">
          Save Banner
        </button>
      </form>

      {/* Show Existing Banner */}
      {existingBanner && (
        <div className="mt-6">
          <h3 className="font-bold text-lg">Current Banner</h3>

          {existingBanner.image && (
            <img
              src={`data:image/jpeg;base64,${existingBanner.image}`}
              className="mt-3 w-64 rounded"
            />
          )}

          {existingBanner.video && (
            <video
              src={`data:video/mp4;base64,${existingBanner.video}`}
              controls
              className="mt-3 w-72 rounded"
            />
          )}

          <button
            onClick={deleteBanner}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete Banner
          </button>
        </div>
      )}
    </div>
  );
};

export default FridayBanner;
