import mongoose from "mongoose";

const makeBodyOrQueryValidator = (schema, source = "body") => {
  if (!schema)
    throw new TypeError(
      `Missing "schema" param: makeBodyOrQueryValidator() - app-utility.js`
    );

  if (source !== "body" && source !== "query" && source !== "params")
    throw new TypeError(
      `Invalid "source" param: makeBodyOrQueryValidator() - app-utility.js`
    );

  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      stripUnknown: true,
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: error.details.map((d) => d.message).join(", "),
      });
    }
    if (source !== "query") req[source] = value;
    return next();
  };
};

const escapeRegExp = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex meta-chars

/**
 * Safely normalize userId input and return an ObjectId
 */
const normalizeToObjectId = (maybeId) => {
  // unwrap MongoDB extended JSON formats like { $oid: "..." } or { _id: "..." }
  if (maybeId && typeof maybeId === "object") {
    if (maybeId.$oid) maybeId = maybeId.$oid;
    else if (maybeId._id) maybeId = maybeId._id;
  }

  if (maybeId == null) {
    throw new Error("No userId provided");
  }

  const str = String(maybeId).trim();

  if (!mongoose.Types.ObjectId.isValid(str)) {
    throw new Error("Invalid userId supplied to analytics: " + str);
  }

  return new mongoose.mongo.ObjectId(str);
};

/**
 * Validates that the maxAmount is not smaller than minAmount.
 *
 * @param {Object} params - The input parameters
 * @param {number|string} params.minAmount - Minimum amount
 * @param {number|string} params.maxAmount - Maximum amount
 * @returns {[boolean, string|null]} Returns [isValid, errorMessage]
 */
const validateMinMaxAmountParams = ({ maxAmount, minAmount }) => {
  if (
    minAmount !== "" &&
    maxAmount !== "" &&
    minAmount !== null &&
    maxAmount !== null &&
    !isNaN(minAmount) &&
    !isNaN(maxAmount) &&
    Number(maxAmount) < Number(minAmount)
  ) {
    return [
      false,
      "Maximum amount should be greater than or equal to minimum amount.",
    ];
  }

  return [true, null];
};

export {
  makeBodyOrQueryValidator,
  escapeRegExp,
  normalizeToObjectId,
  validateMinMaxAmountParams,
};
