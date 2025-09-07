import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Button, IconButton, TextField, Typography } from "@mui/material";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import toast from "react-hot-toast";
import { BarLoader } from "react-spinners";

export default function ReelUploadComplete() {
  const [formFields, setFormFields] = useState({
    title: "",
    description: "",
    video_url: "",
  });
  const [video, setVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setVideo({
        file: acceptedFiles[0],
        index: 0,
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".mov", ".avi"] },
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB limit for Cloudinary free tier
  });

  const removeVideo = () => {
    setVideo(null);
    setFormFields((prev) => ({ ...prev, video_url: "" }));
  };

  const uploadVideo = async () => {
    if (!video) {
      toast.error("Please select a video!");
      return;
    }

    setVideoLoading(true);

    try {
      let data = new FormData();
      data.append("file", video.file);
      data.append("upload_preset", "vapess");
      data.append("cloud_name", "dibwum71a");
      data.append("resource_type", "video");

      console.log("Sending video upload request:", {
        fileName: video.file.name,
        size: video.file.size,
      });

      let response = await axios.post(
        "https://api.cloudinary.com/v1_1/dibwum71a/video/upload",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Upload response:", response.data);

      if (response.data.secure_url) {
        setFormFields((prev) => ({
          ...prev,
          video_url: response.data.secure_url,
        }));
        toast.success("Video uploaded successfully!");
        setVideo(null);
      } else {
        throw new Error("No secure URL returned from Cloudinary");
      }
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error?.message || error.message);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formFields.title || !formFields.video_url) {
      toast.error("Title and video URL are required!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3003/api/reel/create-reel", // Use "https://api.bzcart.store/api/reel/create-reel" for production
        {
          title: formFields.title,
          description: formFields.description,
          video_url: formFields.video_url,
        }
      );
      toast.success("Reel created successfully!");
      setFormFields({ title: "", description: "", video_url: "" });
    } catch (error) {
      console.error("Reel creation error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to create reel");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Typography
        variant="h4"
        className="font-bold text-gray-900 mb-6 text-center"
      >
        Create a New Reel
      </Typography>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          fullWidth
          label="Title"
          value={formFields.title}
          onChange={(e) =>
            setFormFields({ ...formFields, title: e.target.value })
          }
          placeholder="Enter reel title"
          variant="outlined"
          required
        />
        <TextField
          fullWidth
          label="Description"
          value={formFields.description}
          onChange={(e) =>
            setFormFields({ ...formFields, description: e.target.value })
          }
          placeholder="Enter reel description"
          variant="outlined"
          multiline
          rows={4}
        />
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <Typography
              variant="h6"
              className="font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              Upload Video
            </Typography>
          </div>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-indigo-300 rounded-xl p-6 flex flex-col items-center justify-center w-full cursor-pointer hover:border-indigo-500 transition-all duration-300"
          >
            <input {...getInputProps()} />
            <div className="text-center flex flex-col items-center gap-3">
              <div className="flex justify-center items-center h-12 w-12 bg-indigo-100 rounded-full">
                <Upload className="h-6 w-6 text-indigo-600" />
              </div>
              <Typography variant="h5" className="font-semibold text-gray-700">
                Drag and Drop Your Video Here
              </Typography>
              <Typography className="text-gray-500 text-sm">
                Select one video (MP4, MOV, AVI, max 100MB)
              </Typography>
              <Button
                variant="outlined"
                className="mt-3"
                style={{
                  color: "#7C3AED",
                  borderColor: "#7C3AED",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Browse Video
              </Button>
            </div>
          </div>
          {video && (
            <div className="mt-4">
              <Typography className="text-indigo-600 text-sm mb-2 text-center">
                1 video selected
              </Typography>
              <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3 mb-2 bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="border border-gray-200 rounded-lg p-1">
                    <video
                      src={URL.createObjectURL(video.file)}
                      width={48}
                      height={48}
                      className="rounded-md object-cover"
                      controls
                    />
                  </div>
                  <div>
                    <Typography className="text-gray-900 font-medium">
                      {video.file.name}
                    </Typography>
                    <Typography className="text-gray-500 text-sm">
                      {(video.file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </div>
                </div>
                <IconButton onClick={removeVideo}>
                  <IoClose color="#EF4444" size={24} />
                </IconButton>
              </div>
              <Button
                disabled={videoLoading || !video}
                onClick={uploadVideo}
                className="w-full mt-4"
                style={{
                  background:
                    videoLoading || !video
                      ? "#D1D5DB"
                      : "linear-gradient(to right, #4F46E5, #A855F7)",
                  color: "white",
                  borderRadius: "8px",
                  padding: "12px",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                {videoLoading ? <BarLoader color="white" /> : "Upload Video"}
              </Button>
            </div>
          )}
          {formFields.video_url && (
            <Typography className="text-green-600 text-sm mt-2 text-center">
              Video URL: {formFields.video_url}
            </Typography>
          )}
        </div>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!formFields.title || !formFields.video_url}
          style={{
            background:
              !formFields.title || !formFields.video_url
                ? "#D1D5DB"
                : "linear-gradient(to right, #4F46E5, #A855F7)",
            color: "white",
            borderRadius: "8px",
            padding: "12px",
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Create Reel
        </Button>
      </form>
    </div>
  );
}