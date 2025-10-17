import Joi from "joi";

const setBudgetSchema = Joi.object({
  month: Joi.string()
    .trim()
    .pattern(/^\d{4}-\d{2}$/)
    .required(), // YYYY-MM
  amount: Joi.number().min(0).required(),
});

const getBudgetsSchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(20).default(20),
});

const getBudgetParamsSchema = Joi.object({
  month: Joi.string()
    .trim()
    .pattern(/^\d{4}-\d{2}$/)
    .required(),
});

export { setBudgetSchema, getBudgetsSchema, getBudgetParamsSchema };
