import express from "express";

import authMiddleware from "../../middleware/auth.js";
import { controllers } from "../../modules-loader.js";
import {
  validateCreateTransaction,
  validateIdParam,
  validateListTransactions,
  validateUpdateTransaction,
} from "./transaction-validator.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateCreateTransaction,
  controllers.TransactionController.createTransaction
);

router.get(
  "/",
  authMiddleware,
  validateListTransactions,
  controllers.TransactionController.getTransactions
);

router.get(
  "/:id",
  authMiddleware,
  validateIdParam,
  controllers.TransactionController.getTransaction
);

router.patch(
  "/:id",
  authMiddleware,
  validateIdParam,
  validateUpdateTransaction,
  controllers.TransactionController.updateTransaction
);

router.delete(
  "/:id",
  authMiddleware,
  validateIdParam,
  controllers.TransactionController.deleteTransaction
);

export default { indexRoute: "/transaction", router };
