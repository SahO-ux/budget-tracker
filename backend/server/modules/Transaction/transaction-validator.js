import { makeBodyOrQueryValidator } from "../../lib/app-utility.js";
import {
  createTransactionSchema,
  getTransactionsSchema,
  updateTransactionSchema,
} from "./transaction-validation-schemas.js";

const validateCreateTransaction = makeBodyOrQueryValidator(
  createTransactionSchema
);
const validateUpdateTransaction = makeBodyOrQueryValidator(
  updateTransactionSchema
);
const validateListTransactions = makeBodyOrQueryValidator(
  getTransactionsSchema,
  "query"
);

export {
  validateCreateTransaction,
  validateUpdateTransaction,
  validateListTransactions,
};
