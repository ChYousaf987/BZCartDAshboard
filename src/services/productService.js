// const BASE_URL = "http://72.60.104.192:3003/api/products";
const BASE_URL = "http://72.60.104.192:3003/api/products";

export const createProduct = async (productData) => {
  const response = await fetch(`${BASE_URL}/create-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create product");
  }
  return data;
};

export const getProducts = async () => {
  const response = await fetch(`${BASE_URL}/products`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch products");
  }
  return data;
};

export const getProductById = async (id) => {
  const response = await fetch(`${BASE_URL}/product/${id}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch product");
  }
  return data;
};

export const updateProduct = async (id, productData) => {
  const response = await fetch(`${BASE_URL}/product/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update product");
  }
  return data;
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${BASE_URL}/product/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete product");
  }
  return data;
};
