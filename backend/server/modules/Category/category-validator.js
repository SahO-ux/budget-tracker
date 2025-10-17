import { makeBodyOrQueryValidator } from "../../lib/app-utility.js";
import {
  createCategorySchema,
  getCategoriesSchema,
  updateCategorySchema,
} from "./category-validation-schemas.js";

const validateCreateCategory = makeBodyOrQueryValidator(createCategorySchema);
const validateUpdateCategory = makeBodyOrQueryValidator(updateCategorySchema);
const validateListCategories = makeBodyOrQueryValidator(
  getCategoriesSchema,
  "query"
);

export {
  validateCreateCategory,
  validateUpdateCategory,
  validateListCategories,
};
