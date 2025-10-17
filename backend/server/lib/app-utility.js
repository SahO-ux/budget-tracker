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
    req[source] = value;
    return next();
  };
};

export { makeBodyOrQueryValidator };
