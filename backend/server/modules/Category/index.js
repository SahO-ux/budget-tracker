import express from "express";

import { controllers } from "../../modules-loader.js";
import authMiddleware from "../../middleware/auth.js";
import {
  validateCreateCategory,
  validateListCategories,
  validateUpdateCategory,
} from "./category-validator.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateCreateCategory,
  controllers.CategoryController.createCategory
);

router.get(
  "/",
  authMiddleware,
  validateListCategories,
  controllers.CategoryController.getCategories
);

router.get("/:id", authMiddleware, controllers.CategoryController.getCategory);

router.patch(
  "/:id",
  authMiddleware,
  validateUpdateCategory,
  controllers.CategoryController.updateCategory
);

router.delete(
  "/:id",
  authMiddleware,
  controllers.CategoryController.deleteCategory
);

export default {
  indexRoute: "/category",
  router,
};
