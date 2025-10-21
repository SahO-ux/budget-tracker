import { makeBodyOrQueryValidator } from "../../lib/app-utility.js";
import {
  createTransactionSchema,
  getTransactionsSchema,
  idSchema,
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

const validateIdParam = makeBodyOrQueryValidator(idSchema, "params");

export {
  validateCreateTransaction,
  validateUpdateTransaction,
  validateListTransactions,
  validateIdParam,
};
