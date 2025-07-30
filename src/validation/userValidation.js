const Joi = require("joi");

exports.registerSchema = Joi.object({
  fullName: Joi.string().required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
  }),

  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email cannot be empty",
    "string.email": "Email must be valid",
  }),

  password: Joi.string()
    .pattern(new RegExp(/^[A-Za-z\d@$!%*?&]{8,}$/))
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and may include letters, numbers, and special characters",
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),

  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Passwords do not match",
    "any.required": "Please confirm your password",
    "string.empty": "Confirm password cannot be empty",
  }),
});

exports.registerAdminSchema = Joi.object({
  fullName: Joi.string().required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email cannot be empty",
    "string.email": "Email must be valid",
  }),
  password: Joi.string()
    .pattern(new RegExp(/^[A-Za-z\d@$!%*?&]{8,}$/))
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and may include letters, numbers, and special characters",
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Passwords do not match",
    "any.required": "Please confirm your password",
    "string.empty": "Confirm password cannot be empty",
  }),
  role: Joi.string().valid("admin", "Customer").optional(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email cannot be empty",
    "string.email": "Email must be valid",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
  }),
});
