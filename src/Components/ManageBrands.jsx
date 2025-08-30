import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands, deleteBrand } from "../features/brands/brandSlice";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { Button } from "@mui/material";

const ManageBrands = () => {
  const dispatch = useDispatch();
  const { brands, loading, error } = useSelector((state) => state.brands || {});

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await dispatch(deleteBrand(id)).unwrap();
        toast.success("Brand deleted successfully!");
      } catch (err) {
        console.error("Error deleting brand:", err);
        toast.error("Failed to delete brand: " + err.message);
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Brands</h2>
      {loading && <PulseLoader color="#4F46E5" />}
      {error && <p className="text-red-500">{error}</p>}
      {brands.length === 0 && !loading && !error && (
        <p className="text-gray-500">No brands found.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {brands.map((brand) => (
          <div
            key={brand._id}
            className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition"
          >
            <img
              src={brand.image}
              alt="Brand"
              className="w-full h-32 object-contain mb-2"
            />
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 />}
              onClick={() => handleDelete(brand._id)}
              className="w-full"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageBrands;