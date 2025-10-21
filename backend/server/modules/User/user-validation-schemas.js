import Joi from "joi";

const registerSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().lowercase().trim().email().required(),
  password: Joi.string().trim().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().lowercase().trim().email().required(),
  password: Joi.string().trim().min(6).max(128).required(),
});

export { registerSchema, loginSchema };
