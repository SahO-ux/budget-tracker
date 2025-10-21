import { makeBodyOrQueryValidator } from "../../lib/app-utility.js";
import {
  createCategorySchema,
  getCategoriesSchema,
  idSchema,
  updateCategorySchema,
} from "./category-validation-schemas.js";

const validateCreateCategory = makeBodyOrQueryValidator(createCategorySchema);
const validateUpdateCategory = makeBodyOrQueryValidator(updateCategorySchema);
const validateListCategories = makeBodyOrQueryValidator(
  getCategoriesSchema,
  "query"
);
const validateIdParam = makeBodyOrQueryValidator(idSchema, "params");

export {
  validateCreateCategory,
  validateUpdateCategory,
  validateListCategories,
  validateIdParam,
};
