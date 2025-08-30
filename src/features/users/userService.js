import axios from "axios";

export const regUser = async (data) => {
  const response = await axios.post(
    "http://localhost:3003/api/users/register-user",
    data
  );

  if (response.data) {
    localStorage.setItem("myUser", JSON.stringify(response.data));
  }

  return response.data;
};

export const logUser = async (data) => {
  const response = await axios.post(
    "http://localhost:3003/api/users/login-user",
    data
  );

  if (response.data) {
    localStorage.setItem("myUser", JSON.stringify(response.data));
  }

  return response.data;
};

export const logout = async () => {
  localStorage.removeItem("myUser");
};

export const verifyOTP = async (otpData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(
    `http://localhost:3003/api/users/verify-otp`,
    otpData,
    config
  );

  return response.data;
};
