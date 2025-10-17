import { makeBodyOrQueryValidator } from "../../lib/app-utility.js";
import { loginSchema, registerSchema } from "./user-validation-schemas.js";

const validateRegister = makeBodyOrQueryValidator(registerSchema);
const validateLogin = makeBodyOrQueryValidator(loginSchema);

export { validateRegister, validateLogin };
