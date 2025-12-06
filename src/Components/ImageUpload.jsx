import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, GripVertical } from "lucide-react";
import { Button, IconButton, Typography } from "@mui/material";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import toast from "react-hot-toast";
import { BarLoader } from "react-spinners";
import { ReactSortable } from "react-sortablejs";

// Compress and convert images to WebP client-side with a target max size
async function compressAndConvertToWebP(file, maxKB = 100) {
  const maxBytes = maxKB * 1024;

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  // Setup canvas at same size (we'll scale down if needed)
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let width = img.width;
  let height = img.height;

  // If image is very large, cap dimensions to speed up processing
  const MAX_DIM = 1600;
  if (width > MAX_DIM || height > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // Try reducing quality until under maxBytes or quality too low
  let quality = 0.92;
  let blob = await new Promise((res) =>
    canvas.toBlob(res, "image/webp", quality)
  );
  // If already under size, return
  while (blob && blob.size > maxBytes && quality > 0.15) {
    quality -= 0.12; // reduce quality
    blob = await new Promise((res) =>
      canvas.toBlob(res, "image/webp", Math.max(0.08, quality))
    );
  }

  // If still too big, try scaling down dimensions progressively
  let scale = 0.9;
  while (blob && blob.size > maxBytes && (width > 200 || height > 200)) {
    width = Math.round(width * scale);
    height = Math.round(height * scale);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    quality = Math.max(0.5, quality - 0.05);
    blob = await new Promise((res) =>
      canvas.toBlob(res, "image/webp", quality)
    );
    scale -= 0.05;
    if (scale < 0.5) break;
  }

  if (!blob) throw new Error("Failed to convert image");

  return blob; // Blob in webp format
}

export default function ImageUpload({
  formFields,
  setFormFields,
  fieldName = "images",
  singleImage = false,
  setImageUploading,
}) {
  // ✅ Prevent crash when not provided
  if (!setImageUploading) setImageUploading = () => {};

  const [images, setImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [processedPreviews, setProcessedPreviews] = useState([]); // { index, name, dataUri, size }
  const [processedReady, setProcessedReady] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const newImages = acceptedFiles.map((file, index) => ({
        file,
        index: images.length + index,
      }));
      console.log(
        "onDrop - Dropped images:",
        newImages.map((img) => ({ index: img.index, name: img.file.name }))
      );
      if (singleImage) {
        setImages(newImages.slice(0, 1));
        setProcessedPreviews([]);
        setProcessedReady(false);
      } else {
        setImages((prevImages) => [...prevImages, ...newImages]);
        setProcessedPreviews([]);
        setProcessedReady(false);
      }
    },
    [images.length, singleImage]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: !singleImage,
  });

  const filterImages = useCallback(
    (index, event) => {
      event.stopPropagation();
      event.preventDefault();
      console.log("filterImages - Clicked to remove image with index:", index);
      console.log(
        "filterImages - Current images:",
        images.map((img) => ({ index: img.index, name: img.file.name }))
      );
      const newImages = images.filter((item) => item.index !== index);
      console.log(
        "filterImages - Filtered images:",
        newImages.map((img) => ({ index: img.index, name: img.file.name }))
      );
      setImages([...newImages]); // Spread to ensure new array reference
      setProcessedPreviews([]);
      setProcessedReady(false);
    },
    [images]
  );

  const handleSort = useCallback((newList) => {
    console.log(
      "handleSort - New order:",
      newList.map((img) => ({ index: img.index, name: img.file.name }))
    );
    setImages(newList);
  }, []);

  const uploadImage = async () => {
    if (!images.length) {
      toast.error("Please select at least one image!");
      return;
    }
    // Two-step flow:
    // 1) If not yet processed, process each image (try backend, fallback to client), show sizes and require confirmation
    // 2) If processedReady, upload processedPreviews to Cloudinary

    setImageLoading(true);
    setImageUploading(true);

    // Step 1: process images and show sizes
    if (!processedReady) {
      const previews = [];
      for (const item of images) {
        try {
          let dataUri = null;
          let processedSize = 0;

          try {
            const procForm = new FormData();
            procForm.append("file", item.file);

            console.log(
              "uploadImage - sending file to backend for processing",
              {
                name: item.file.name,
                size: item.file.size,
              }
            );

            const procResp = await axios.post(
              "https://bzbackend.online/api/uploads/process-image",
              procForm,
              { headers: { "Content-Type": "multipart/form-data" } }
            );

            dataUri = procResp.data.dataUri;
            processedSize = procResp.data.size || 0;
            console.log("uploadImage - backend processed size", processedSize);
          } catch (backendErr) {
            // Backend failed (500 or network); fallback to client-side conversion
            console.warn(
              "uploadImage - backend processing failed, falling back to client-side",
              backendErr?.response?.data || backendErr?.message || backendErr
            );
            try {
              const blob = await compressAndConvertToWebP(item.file, 100);
              processedSize = blob.size;
              dataUri = await new Promise((res) => {
                const reader = new FileReader();
                reader.onload = () => res(reader.result);
                reader.onerror = () => res(null);
                reader.readAsDataURL(blob);
              });
            } catch (clientErr) {
              console.error(
                "uploadImage - client-side processing failed:",
                clientErr
              );
              toast.error(
                `Processing failed for ${item.file.name}. Try a smaller image.`
              );
              continue;
            }
          }

          const isWebP = !!dataUri && dataUri.startsWith("data:image/webp");
          const isWithin = processedSize && processedSize <= 100 * 1024;
          const valid = isWebP && isWithin;
          previews.push({
            index: item.index,
            name: item.file.name,
            dataUri,
            size: processedSize,
            valid,
          });
        } catch (e) {
          console.error(
            "uploadImage - processing failed for",
            item.file.name,
            e
          );
          toast.error(
            `Processing failed for ${item.file.name}: ${e.message || e}`
          );
        }
      }

      if (!previews.length) {
        toast.error("No images could be processed. Try different images.");
        setImageLoading(false);
        setImageUploading(false);
        return;
      }

      setProcessedPreviews(previews);
      setProcessedReady(true);
      setImageLoading(false);
      setImageUploading(false);
      // User will need to confirm upload (press button again)
      return;
    }

    // Step 2: processedReady -> upload to Cloudinary
    const uploadTasks = processedPreviews.map(async (p) => {
      try {
        if (!p.dataUri) throw new Error("No processed data URI available");

        // If processed size is within limit, upload to Cloudinary
        if (p.size && p.size <= 100 * 1024) {
          const cloudForm = new FormData();
          cloudForm.append("file", p.dataUri);
          cloudForm.append("upload_preset", "vapess");
          cloudForm.append("cloud_name", "dibwum71a");

          const response = await axios.post(
            "https://api.cloudinary.com/v1_1/dibwum71a/image/upload",
            cloudForm,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          if (response.data?.secure_url) return response.data.secure_url;
          throw new Error("No secure URL returned from Cloudinary");
        }

        // Otherwise (too large for Cloudinary policy/requirement), upload to server via multer
        // Convert dataURI to Blob
        function dataURItoBlob(dataURI) {
          const byteString = atob(dataURI.split(",")[1]);
          const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          return new Blob([ab], { type: mimeString });
        }

        const blob = dataURItoBlob(p.dataUri);
        const serverForm = new FormData();
        serverForm.append("file", blob, `${p.name.replace(/\s+/g, "_")}.webp`);

        const serverResp = await axios.post(
          "https://bzbackend.online/api/uploads/upload-server",
          serverForm,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (serverResp.data?.url) return serverResp.data.url;
        throw new Error("No url returned from server upload");
      } catch (error) {
        console.error(
          "uploadImage - upload error:",
          error?.response?.data || error?.message || error
        );
        toast.error(
          error?.response?.data?.message || error.message || "Upload failed"
        );
        throw error;
      }
    });

    try {
      const imagesData = await Promise.all(uploadTasks);
      toast.success("Image(s) uploaded successfully!");
      setFormFields((prevFields) => ({
        ...prevFields,
        [fieldName]: singleImage ? imagesData[0] : imagesData,
      }));
      setImages([]);
      setProcessedPreviews([]);
      setProcessedReady(false);
    } catch (err) {
      console.error("uploadImage - Batch upload failed:", err);
    } finally {
      setImageLoading(false);
      setImageUploading(false);
    }
  };

  const ImageItem = ({ item }) => (
    <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3 mb-2 bg-gray-100 hover:bg-gray-100 transition-colors duration-200">
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
          {processedPreviews?.length > 0 && (
            <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
              <Typography className="text-sm font-semibold mb-2">
                Processed Preview Sizes
              </Typography>
              {processedPreviews.map((p) => (
                <div
                  key={p.index}
                  className="flex justify-between text-sm text-gray-700 mb-1"
                >
                  <div className="truncate pr-4">{p.name}</div>
                  <div
                    className={
                      p.size > 100 * 1024 ? "text-red-600" : "text-green-600"
                    }
                  >
                    {p.size ? `${Math.round(p.size / 1024)} KB` : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
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
            {imageLoading ? (
              <BarLoader color="white" />
            ) : processedReady ? (
              `Confirm Upload (${processedPreviews.length})`
            ) : (
              "Prepare & Show Sizes"
            )}
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
          {processedPreviews?.length > 0 && (
            <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
              <Typography className="text-sm font-semibold mb-2">
                Processed Preview
              </Typography>
              {processedPreviews.map((p) => (
                <div
                  key={p.index}
                  className="flex justify-between text-sm text-gray-700 mb-1"
                >
                  <div className="truncate pr-4">{p.name}</div>
                  <div
                    className={
                      p.size > 100 * 1024 ? "text-red-600" : "text-green-600"
                    }
                  >
                    {p.size ? `${Math.round(p.size / 1024)} KB` : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}

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
            {imageLoading ? (
              <BarLoader color="white" />
            ) : processedReady ? (
              `Confirm Upload (${processedPreviews.length})`
            ) : (
              "Prepare & Show Sizes"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
