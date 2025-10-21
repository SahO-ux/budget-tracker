import Joi from "joi";

import { TransactionAndCategoryTypeEnums } from "../../lib/global-constants.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createTransactionSchema = Joi.object({
  amount: Joi.number().min(1).required(),
  type: Joi.string()
    .trim()
    .valid(...Object.values(TransactionAndCategoryTypeEnums))
    .required(),
  category: Joi.string()
    .trim()
    .pattern(objectIdPattern)
    .message('"category" must be a valid ObjectId')
    .required(),
  note: Joi.string().trim().allow("").optional(),
});

const updateTransactionSchema = Joi.object({
  amount: Joi.number().optional(),
  type: Joi.string()
    .trim()
    .valid(...Object.values(TransactionAndCategoryTypeEnums))
    .optional(),
  category: Joi.string()
    .trim()
    .pattern(objectIdPattern)
    .message('"category" must be a valid ObjectId')
    .optional(),
  note: Joi.string().trim().allow("").optional(),
});

const getTransactionsSchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(20).default(20),
  category: Joi.string()
    .trim()
    .pattern(objectIdPattern)
    .message('"category" must be a valid ObjectId')
    .optional(),
  type: Joi.string()
    .trim()
    .valid(...Object.values(TransactionAndCategoryTypeEnums))
    .optional(),
  minAmount: Joi.number().optional(),
  maxAmount: Joi.number().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

const idSchema = Joi.object({
  id: Joi.string()
    .trim()
    .pattern(objectIdPattern)
    .message('"id" must be a valid ObjectId')
    .required(),
});

export {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsSchema,
  idSchema,
};
