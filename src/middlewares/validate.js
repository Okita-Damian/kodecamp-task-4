const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) return next(error); // Send error to global errorHandler
  next();
};

module.exports = validate;
