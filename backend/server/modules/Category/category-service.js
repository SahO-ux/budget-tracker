import { models } from "../../modules-loader.js";

const createCategory = async ({ userId, name, type, color = "" }) => {
  const trimmedName = name?.trim();

  const existingCategory = await models.Category.findOne({
    user: userId,
    name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    isDeleted: false,
  });

  if (existingCategory) {
    throw new Error(`Category "${name}" already exists`);
  }
  const payload = { user: userId, name, type, color };
  return await models.Category.create(payload);
};

const getCategories = async ({ userId, skip = 0, limit = 50 }) => {
  const CategoryModel = models.Category;

  const query = { user: userId, isDeleted: false };
  const categories = await CategoryModel.find(query)
    .sort({ name: 1 })
    .skip(Number(skip))
    .limit(Number(limit))
    .lean();
  const total = await CategoryModel.countDocuments(query);

  return { results: categories, total };
};

const getCategoryById = async (id, userId) => {
  return await models.Category.findOne({
    _id: id,
    user: userId,
    isDeleted: false,
  }).lean();
};

const updateCategory = async (id, userId, payload) => {
  return await models.Category.findOneAndUpdate(
    { _id: id, user: userId, isDeleted: false },
    payload,
    {
      new: true,
    }
  ).lean();
};

const deleteCategory = async (id, userId) => {
  return await models.Category.findOneAndUpdate(
    { _id: id, user: userId, isDeleted: false },
    { isDeleted: true }
  );
};

export default {
  serviceName: "CategoryService",
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
