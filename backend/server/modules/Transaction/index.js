import express from "express";

import authMiddleware from "../../middleware/auth.js";
import { controllers } from "../../modules-loader.js";
import {
  validateCreateTransaction,
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
  controllers.TransactionController.getTransaction
);

router.patch(
  "/:id",
  authMiddleware,
  validateUpdateTransaction,
  controllers.TransactionController.updateTransaction
);

router.delete(
  "/:id",
  authMiddleware,
  controllers.TransactionController.deleteTransaction
);

export default { indexRoute: "/transaction", router };
