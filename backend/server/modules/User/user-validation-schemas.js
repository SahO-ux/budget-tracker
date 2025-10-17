import Joi from "joi";

const registerSchema = Joi.object({
  name: Joi.string().trim().allow("").max(100).optional(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().lowercase().min(6).max(128).required(),
});

export { registerSchema, loginSchema };
