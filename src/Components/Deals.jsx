import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDeals } from "../store/dealSlice";
import { Link } from "react-router-dom";

const Deals = () => {
  const dispatch = useDispatch();
  const { deals, loading, error } = useSelector((state) => state.deals);
  const user = JSON.parse(localStorage.getItem("myUser"));

  useEffect(() => {
    dispatch(fetchDeals());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const dealsArray = Array.isArray(deals) ? deals : [];
  console.log("Deals.jsx - dealsArray:", dealsArray); // Debugging

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Deals</h1>
      {["superadmin", "admin"].includes(user?.role) && (
        <Link
          to="/add-deal"
          className="mb-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New Deal
        </Link>
      )}
      {dealsArray.length === 0 ? (
        <p>No deals available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealsArray.map((deal) => (
            <div
              key={deal._id}
              className="border rounded-lg p-4 shadow-md"
              style={{ backgroundColor: deal.bg_color }}
            >
              <img
                src={deal.deal_images[0] || "/placeholder-image.jpg"}
                alt={deal.deal_name}
                className="w-full h-48 object-cover rounded"
              />
              <h2 className="text-xl font-semibold mt-2">{deal.deal_name}</h2>
              <p className="text-gray-600">{deal.deal_description}</p>
              <p className="text-red-500 font-bold">
                Deal Price: ${deal.deal_price}
              </p>
              <p className="text-gray-500 line-through">
                Original Price: ${deal.original_price}
              </p>
              <p className="text-gray-600">
                Expiry: {new Date(deal.deal_expiry).toLocaleDateString()}
              </p>
              {["superadmin", "admin"].includes(user?.role) && (
                <Link
                  to={`/edit-deal/${deal._id}`}
                  className="mt-2 inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit Deal
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deals;
