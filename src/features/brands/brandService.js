import axios from "axios";

// Hardcoded URL to bypass proxy issues
const API_URL = "http://72.60.104.192:3003/api/brands/";

// Axios interceptor to debug requests
axios.interceptors.request.use(
  (config) => {
    console.log("Axios request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error("Axios request error:", error);
    return Promise.reject(error);
  }
);

const addBrand = async (brandData) => {
  const requestUrl = API_URL;
  console.log("Sending addBrand request to:", requestUrl, "with data:", brandData);
  try {
    const response = await axios.post(requestUrl, brandData, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("addBrand response:", response.data);
    return response.data;
  } catch (error) {
    console.error("addBrand error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: requestUrl,
    });
    throw error;
  }
};

const getBrands = async () => {
  console.log("Fetching brands from:", API_URL);
  try {
    const response = await axios.get(API_URL);
    console.log("getBrands response:", response.data);
    return response.data;
  } catch (error) {
    console.error("getBrands error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

const deleteBrand = async (id) => {
  const requestUrl = `${API_URL}${id}`;
  console.log("Sending deleteBrand request to:", requestUrl);
  try {
    const response = await axios.delete(requestUrl);
    console.log("deleteBrand response:", response.data);
    return response.data;
  } catch (error) {
    console.error("deleteBrand error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: requestUrl,
    });
    throw error;
  }
};

const brandService = {
  addBrand,
  getBrands,
  deleteBrand,
};

export default brandService;