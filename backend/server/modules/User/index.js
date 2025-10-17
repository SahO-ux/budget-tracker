import express from "express";

import { controllers } from "../../modules-loader.js";
import authMiddleware from "../../middleware/auth.js";
import { validateLogin, validateRegister } from "./user-validator.js";

const router = express.Router();

router.post("/register", validateRegister, controllers.UserController.register);
router.post("/login", validateLogin, controllers.UserController.login);
router.get(
  "/user-info",
  authMiddleware,
  controllers.UserController.getUserInfo
);

export default {
  indexRoute: "/user",
  router,
};
