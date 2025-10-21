import API from "../../api";

const getCategories = async ({ skip = 0, limit = 20 } = {}) => {
  const res = await API.get("/category", { params: { skip, limit } });
  return res.data;
};

const createCategory = async (payload) => {
  const res = await API.post("/category", payload);
  return res.data;
};

const updateCategory = async (id, payload) => {
  const res = await API.patch(`/category/${id}`, payload);
  return res.data;
};

const deleteCategory = async (id) => {
  const res = await API.delete(`/category/${id}`);
  return res.data;
};

export { getCategories, createCategory, updateCategory, deleteCategory };
