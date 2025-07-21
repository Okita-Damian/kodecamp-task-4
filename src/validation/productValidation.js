const Joi = require("joi");

exports.productSchema = Joi.object({
  productName: Joi.string().min(2).max(100).required(),
  cost: Joi.number().min(0).required(),
  productImages: Joi.array().items(Joi.string().uri()),
  description: Joi.string().allow("", null),
  stockStatus: Joi.string().valid("in-stock", "out-of-stock", "low-stock"),
});

exports.productUpdateSchema = Joi.object({
  productName: Joi.string().min(2).max(100),
  cost: Joi.number().min(0),
  productImages: Joi.array().items(Joi.string().uri()),
  description: Joi.string().allow("", null),
  stockStatus: Joi.string().valid("in-stock", "out-of-stock", "low-stock"),
});
