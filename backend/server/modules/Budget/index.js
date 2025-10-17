import express from "express";

import { controllers } from "../../modules-loader.js";
import authMiddleware from "../../middleware/auth.js";
import {
  validateGetBudgetParams,
  validateGetBudgets,
  validateSetBudget,
} from "./budget-validator.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateSetBudget,
  controllers.BudgetController.setBudget
);

router.get(
  "/",
  authMiddleware,
  validateGetBudgets,
  controllers.BudgetController.getBudgets
);

router.get(
  "/:month",
  authMiddleware,
  validateGetBudgetParams,
  controllers.BudgetController.getBudget
);

export default {
  indexRoute: "/budget",
  router,
};
