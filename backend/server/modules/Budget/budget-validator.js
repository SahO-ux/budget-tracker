import { makeBodyOrQueryValidator } from "../../lib/app-utility.js";
import {
  getBudgetParamsSchema,
  getBudgetsSchema,
  setBudgetSchema,
} from "./budget-validation-schemas.js";

const validateSetBudget = makeBodyOrQueryValidator(setBudgetSchema);
const validateGetBudgets = makeBodyOrQueryValidator(getBudgetsSchema, "query");
const validateGetBudgetParams = makeBodyOrQueryValidator(
  getBudgetParamsSchema,
  "params"
);

export { validateSetBudget, validateGetBudgets, validateGetBudgetParams };
