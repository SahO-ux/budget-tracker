import { services } from "../../modules-loader.js";

const createCategory = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const { name, type, color } = req.body;

    const cat = await services.CategoryService.createCategory({
      userId,
      name,
      type,
      color,
    });
    return res.status(201).json({ _id: cat._id });
  } catch (err) {
    console.error("createCategory error:", err.message);
    return res.status(400).json({ message: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const { skip = 0, limit = 20 } = req.query;
    const categories = await services.CategoryService.getCategories({
      userId,
      skip,
      limit,
    });
    return res.json(categories);
  } catch (err) {
    console.error("getCategories error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getCategory = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const categoryId = req?.params?.id;

    if (!categoryId)
      return res.status(400).json({
        message: `Missing parameter: Category "id" is required in URL path`,
      });

    const category = await services.CategoryService.getCategoryById({
      id: categoryId,
      userId,
    });

    if (!category)
      return res.status(404).json({ message: "Category not found" });
    return res.json(category);
  } catch (err) {
    console.error("getCategory error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const categoryId = req?.params?.id;

    if (!categoryId)
      return res.status(400).json({
        message: `Missing parameter: Category "id" is required in URL path`,
      });

    const updated = await services.CategoryService.updateCategory({
      id: categoryId,
      userId,
      payload: req.body,
    });

    if (!updated)
      return res.status(404).json({ message: "Category not found" });
    return res.json(updated);
  } catch (err) {
    console.error("updateCategory error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    const categoryId = req?.params?.id;

    if (!categoryId)
      return res.status(400).json({
        message: `Missing parameter: Category "id" is required in URL path`,
      });

    const deleted = await services.CategoryService.deleteCategory({
      id: categoryId,
      userId,
    });

    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    return res.json({ message: "deleted" });
  } catch (err) {
    console.error("deleteCategory error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

export default {
  controllerName: "CategoryController",
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
