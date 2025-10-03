import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Dummy user data for Super Admin, Content & SEO Manager (admin), and Team
  const dummyUsers = [
    {
      _id: "1",
      username: "Super Admin",
      email: "Mz007@gmail.com",
      password: "MzMzMz@1721",
      role: "superadmin",
      isApproved: true,
      token: "dummy-superadmin-token",
    },
    {
      _id: "2",
      username: "Content Manager",
      email: "content@example.com",
      password: "content123",
      role: "admin",
      isApproved: true,
      token: "dummy-admin-token",
    },
    {
      _id: "3",
      username: "Team Member",
      email: "team@example.com",
      password: "team123",
      role: "team",
      isApproved: true,
      token: "dummy-team-token",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous error
    const user = dummyUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Store in localStorage and navigate to /product
      localStorage.setItem("myUser", JSON.stringify(user));
      navigate("/product");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Dashboard Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
