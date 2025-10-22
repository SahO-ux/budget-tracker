import Joi from "joi";

import { TransactionAndCategoryTypeEnums } from "../../lib/global-constants.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  type: Joi.string()
    .trim()
    .valid(...Object.values(TransactionAndCategoryTypeEnums))
    .required(),
  color: Joi.string().trim().allow("").optional(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  type: Joi.string()
    .trim()
    .valid(...Object.values(TransactionAndCategoryTypeEnums))
    .required(),
  color: Joi.string().trim().allow("").optional(),
});

const getCategoriesSchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(200).default(20),
  name: Joi.string().trim().optional(),
  type: Joi.string().trim().optional(),
});

const idSchema = Joi.object({
  id: Joi.string()
    .trim()
    .pattern(objectIdPattern)
    .message('"id" must be a valid ObjectId')
    .required(),
});

export {
  createCategorySchema,
  updateCategorySchema,
  getCategoriesSchema,
  idSchema,
};
