import { models } from "../../modules-loader.js";
import { TransactionAndCategoryTypeEnums } from "../../lib/global-constants.js";
import { escapeRegExp } from "../../lib/app-utility.js";

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

const getCategories = async ({ userId, skip = 0, limit = 50, name, type }) => {
  const CategoryModel = models.Category;
  const trimmedName = name?.trim();
  const trimmedType = type?.trim();

  const query = {
    user: userId,
    isDeleted: false,
  };

  if (trimmedName) {
    query.name = { $regex: new RegExp(escapeRegExp(trimmedName), "i") };
  }

  if (trimmedType) {
    query.type = { $regex: new RegExp(`^${escapeRegExp(trimmedType)}$`, "i") };
  }

  const categories = await CategoryModel.find(query)
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit))
    .lean();
  const total = await CategoryModel.countDocuments(query);

  return { results: categories, total };
};

const getCategoryById = async ({ id, userId }) => {
  return await models.Category.findOne({
    _id: id,
    user: userId,
    isDeleted: false,
  }).lean();
};

const updateCategory = async ({ id, userId, payload }) => {
  return await models.Category.findOneAndUpdate(
    { _id: id, user: userId, isDeleted: false },
    payload,
    {
      new: true,
    }
  ).lean();
};

const deleteCategory = async ({ id, userId }) => {
  return await models.Category.findOneAndUpdate(
    { _id: id, user: userId, isDeleted: false },
    { isDeleted: true }
  );
};

const createDefaultCategoryForUser = async (userId) => {
  if (!userId)
    return console.error(
      `userId is required to create default uncategorized category`
    );

  try {
    // Create default "Uncategorized" categories
    await models.Category.insertMany([
      {
        user: userId,
        name: "Uncategorized",
        type: TransactionAndCategoryTypeEnums.EXPENSE,
        color: "#9CA3AF",
      },
      {
        user: userId,
        name: "Uncategorized",
        type: TransactionAndCategoryTypeEnums.INCOME,
        color: "#9CA3AF",
      },
    ]);
  } catch (err) {
    // Do not block user creation on category errors; log and continue.
    console.error("Failed to create default category for user:", user._id, err);
  }
};

export default {
  serviceName: "CategoryService",
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createDefaultCategoryForUser,
};
