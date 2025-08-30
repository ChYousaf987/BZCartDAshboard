import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import { fetchPendingUsers, approveUser } from "../store/userSlice";

const PendingUsers = () => {
  const dispatch = useDispatch();
  const {
    pendingUsers = [],
    loading,
    error,
  } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchPendingUsers());
  }, [dispatch]);

  const handleApprove = (userId) => {
    dispatch(approveUser(userId))
      .unwrap()
      .then(() => {
        toast.success("User approved successfully!");
      })
      .catch((err) => {
        toast.error(err || "Failed to approve user");
      });
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  if (!pendingUsers || pendingUsers.length === 0) {
    return <p className="text-gray-600">No pending users.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending User Approvals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingUsers.map((user) => (
          <div key={user._id} className="bg-white rounded-xl shadow-lg p-5">
            <h3 className="text-lg font-semibold">{user.username}</h3>
            <p className="text-gray-600">{user.email}</p>
            <button
              onClick={() => handleApprove(user._id)}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Approve
            </button>
          </div>
        ))}
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  );
};

export default PendingUsers;
