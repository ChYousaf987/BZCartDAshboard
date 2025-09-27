import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, GripVertical } from "lucide-react";
import { Button, IconButton, Typography } from "@mui/material";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import toast from "react-hot-toast";
import { BarLoader } from "react-spinners";
import { ReactSortable } from "react-sortablejs";

export default function ImageUpload({
  formFields,
  setFormFields,
  fieldName = "images",
  singleImage = false,
  setImageUploading,
}) {
  const [images, setImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map((file, index) => ({
      file,
      index: images.length + index,
    }));
    console.log("onDrop - Dropped images:", newImages.map((img) => ({ index: img.index, name: img.file.name })));
    if (singleImage) {
      setImages(newImages.slice(0, 1));
    } else {
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  }, [images.length, singleImage]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: !singleImage,
  });

  const filterImages = useCallback((index, event) => {
    event.stopPropagation();
    event.preventDefault();
    console.log("filterImages - Clicked to remove image with index:", index);
    console.log("filterImages - Current images:", images.map((img) => ({ index: img.index, name: img.file.name })));
    const newImages = images.filter((item) => item.index !== index);
    console.log("filterImages - Filtered images:", newImages.map((img) => ({ index: img.index, name: img.file.name })));
    setImages([...newImages]); // Spread to ensure new array reference
  }, [images]);

  const handleSort = useCallback((newList) => {
    console.log("handleSort - New order:", newList.map((img) => ({ index: img.index, name: img.file.name })));
    setImages(newList);
  }, []);

  const uploadImage = async () => {
    if (!images.length) {
      toast.error("Please select at least one image!");
      return;
    }

    setImageLoading(true);
    setImageUploading(true);

    let myImages = images.map(async (item) => {
      try {
        let data = new FormData();
        data.append("file", item?.file);
        data.append("upload_preset", "vapess");
        data.append("cloud_name", "dibwum71a");

        console.log("uploadImage - Sending upload request:", {
          fileName: item?.file?.name,
          size: item?.file?.size,
        });

        let response = await axios.post(
          "https://api.cloudinary.com/v1_1/dibwum71a/image/upload",
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        console.log("uploadImage - Upload response:", response.data);

        if (response.data.secure_url) {
          return response.data.secure_url;
        } else {
          throw new Error("No secure URL returned from Cloudinary");
        }
      } catch (error) {
        console.error("uploadImage - Upload error:", error.response?.data || error.message);
        toast.error(error.response?.data?.error?.message || error.message);
        throw error;
      }
    });

    try {
      let imagesData = await Promise.all(myImages);
      toast.success("Image(s) uploaded successfully!");
      setFormFields((prevFields) => ({
        ...prevFields,
        [fieldName]: singleImage ? imagesData[0] : imagesData,
      }));
      setImages([]);
    } catch (err) {
      console.error("uploadImage - Batch upload failed:", err);
    } finally {
      setImageLoading(false);
      setImageUploading(false);
    }
  };

  const ImageItem = ({ item }) => (
    <div
      className="flex items-center justify-between border border-gray-200 rounded-xl p-3 mb-2 bg-gray-100 hover:bg-gray-100 transition-colors duration-200"
    >
      <div className="flex items-center gap-3">
        {!singleImage && (
          <div className="drag-handle cursor-move">
            <GripVertical color="#666" size={24} />
          </div>
        )}
        <div className="border border-gray-200 rounded-lg p-1">
          {item?.file && (
            <img
              src={URL.createObjectURL(item.file)}
              width={48}
              height={48}
              alt="preview image"
              className="rounded-md object-cover"
              onError={(e) => {
                e.target.src = "https://placehold.co/48x48";
              }}
            />
          )}
        </div>
        <div>
          <Typography className="text-gray-900 font-medium">
            {item?.file?.name || "Unknown Image"}
          </Typography>
          <Typography className="text-gray-500 text-sm">
            {(item?.file?.size / 1024)?.toFixed(0) || 0} KB
          </Typography>
        </div>
      </div>
      <IconButton
        onClick={(e) => {
          console.log("IconButton - Clicked with index:", item.index);
          filterImages(item.index, e);
        }}
      >
        <IoClose color="#EF4444" size={24} />
      </IconButton>
    </div>
  );

  return (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <Typography
          variant="h6"
          className="font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          {singleImage
            ? "Category Image"
            : `${fieldName
                .replace("_", " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}`}
        </Typography>
        <Typography
          className="text-sm font-semibold cursor-pointer hover:text-indigo-600 transition-colors duration-200"
          style={{ color: "#7C3AED" }}
        >
          Add media from URL
        </Typography>
      </div>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-indigo-300 rounded-xl p-6 flex flex-col items-center justify-center w-full max-w-md mx-auto cursor-pointer hover:border-indigo-500 transition-all duration-300"
      >
        <input {...getInputProps()} />
        <div className="text-center flex flex-col items-center gap-3">
          <div className="flex justify-center items-center h-12 w-12 bg-indigo-100 rounded-full">
            <Upload className="h-6 w-6 text-indigo-600" />
          </div>
          <Typography variant="h5" className="font-semibold text-gray-700">
            Drag and Drop Your {singleImage ? "Image" : "Images"} Here
          </Typography>
          <Typography className="text-gray-500 text-sm">
            Select {singleImage ? "one image" : "one or more images"}
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
            Browse {singleImage ? "Image" : "Images"}
          </Button>
        </div>
      </div>
      {images?.length > 0 && !singleImage && (
        <div className="mt-4">
          <Typography className="text-indigo-600 text-sm mb-2 text-center">
            {images.length} image{images.length > 1 ? "s" : ""} selected
          </Typography>
          <ReactSortable
            list={images}
            setList={handleSort}
            animation={150}
            disabled={imageLoading}
            className="space-y-2"
            handle=".drag-handle"
            key={images.map((img) => img.index).join("-")}
          >
            {images.map((item) => (
              <ImageItem key={item.index} item={item} />
            ))}
          </ReactSortable>
          <Button
            disabled={imageLoading || images.length === 0}
            onClick={uploadImage}
            className="w-full mt-4"
            style={{
              background:
                imageLoading || images.length === 0
                  ? "#D1D5DB"
                  : "linear-gradient(to right, #4F46E5, #A855F7)",
              color: "white",
              borderRadius: "8px",
              padding: "12px",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {imageLoading ? <BarLoader color="white" /> : "Upload Image(s)"}
          </Button>
        </div>
      )}
      {images?.length > 0 && singleImage && (
        <div className="mt-4">
          <Typography className="text-indigo-600 text-sm mb-2 text-center">
            {images.length} image selected
          </Typography>
          {images.map((item) => (
            <ImageItem key={item.index} item={item} />
          ))}
          <Button
            disabled={imageLoading || images.length === 0}
            onClick={uploadImage}
            className="w-full mt-4"
            style={{
              background:
                imageLoading || images.length === 0
                  ? "#D1D5DB"
                  : "linear-gradient(to right, #4F46E5, #A855F7)",
              color: "white",
              borderRadius: "8px",
              padding: "12px",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {imageLoading ? <BarLoader color="white" /> : "Upload Image(s)"}
          </Button>
        </div>
      )}
    </div>
  );
}