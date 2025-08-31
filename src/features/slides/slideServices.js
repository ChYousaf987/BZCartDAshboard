const BASE_URL = "https://bzbackend.online/api/slides";

export const createSlide = async (slideData) => {
  const formData = new FormData();
  formData.append("title", slideData.title);
  formData.append("subtitle", slideData.subtitle);
  formData.append("buttonText", slideData.buttonText);
  formData.append("image", slideData.image); // Required main image
  if (slideData.link) formData.append("link", slideData.link);
  if (slideData.background) formData.append("background", slideData.background); // Optional background image

  const response = await fetch(`${BASE_URL}/create-slide`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create slide");
  }
  return data;
};

export const getSlides = async () => {
  const response = await fetch(`${BASE_URL}/slides`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch slides");
  }
  return data;
};

export const getSlideById = async (id) => {
  const response = await fetch(`${BASE_URL}/slide/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch slide");
  }
  return data;
};

export const updateSlide = async (id, slideData) => {
  const formData = new FormData();
  if (slideData.title) formData.append("title", slideData.title);
  if (slideData.subtitle) formData.append("subtitle", slideData.subtitle);
  if (slideData.buttonText) formData.append("buttonText", slideData.buttonText);
  if (slideData.image) formData.append("image", slideData.image); // Optional for updates
  if (slideData.link) formData.append("link", slideData.link);
  if (slideData.background) formData.append("background", slideData.background); // Optional background image

  const response = await fetch(`${BASE_URL}/slide/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update slide");
  }
  return data;
};

export const deleteSlide = async (id) => {
  const response = await fetch(`${BASE_URL}/slide/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete slide");
  }
  return data;
};
