import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { models, services } from "../../modules-loader.js";
import { SALT_ROUNDS } from "./constants.js";

const createUser = async ({ name = "", email, password }) => {
  const UserModel = models.User;
  const _email = email?.trim()?.toLowerCase();
  const _password = password?.trim();

  const existing = await UserModel.findOne({ email: _email }).lean();
  if (existing) throw new Error("User already exists");

  const hash = await bcrypt.hash(_password, SALT_ROUNDS);
  const user = await UserModel.create({
    name,
    email: _email,
    passwordHash: hash,
  });

  // Create default "Uncategorized" category for both "expense" & "income"
  await services.CategoryService.createDefaultCategoryForUser(user._id);

  return { _id: user._id, name: user.name, email: user.email };
};

const authenticate = async ({ email, password }) => {
  const _email = email?.trim()?.toLowerCase();

  const user = await models.User.findOne({ email: _email });
  if (!user) throw new Error("User not found with given email");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Invalid password");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return { token, user: { _id: user._id, name: user.name, email: user.email } };
};

const getUserById = async (id) => {
  return await models.User.findById(id).select("-passwordHash").lean();
};

export default {
  serviceName: "UserService",
  createUser,
  authenticate,
  getUserById,
};
