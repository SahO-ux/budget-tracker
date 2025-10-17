import Joi from "joi";

import { TransactionAndCategoryTypeEnums } from "../../lib/global-constants.js";

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  type: Joi.string()
    .trim()
    .valid(...Object.values(TransactionAndCategoryTypeEnums))
    .required(),
  color: Joi.string().trim().allow("").optional(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  type: Joi.string()
    .trim()
    .valid(...Object.values(TransactionAndCategoryTypeEnums))
    .optional(),
  color: Joi.string().trim().allow("").optional(),
});

const getCategoriesSchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(20).default(20),
});

export { createCategorySchema, updateCategorySchema, getCategoriesSchema };
