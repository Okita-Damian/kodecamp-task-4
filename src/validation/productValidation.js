// validation/productValidation.js

const BaseJoi = require("joi");
const JoiObjectId = require("joi-objectid")(BaseJoi);
const Joi = BaseJoi;

exports.productSchema = Joi.object({
  productName: Joi.string().min(2).max(100).required().messages({
    "string.base": "Product name must be a string",
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 2 characters long",
    "string.max": "Product name must not exceed 100 characters",
    "any.required": "Product name is required",
  }),

  brand: Joi.alternatives()
    .try(JoiObjectId(), Joi.string().min(2).max(20))
    .required()
    .messages({
      "alternatives.match": "Brand must be a valid brand ID or name",
      "any.required": "Brand is required",
    }),

  cost: Joi.number().min(0).required().messages({
    "number.base": "Cost must be a number",
    "number.min": "Cost cannot be negative",
    "any.required": "Cost is required",
  }),

  productImages: Joi.array()
    .items(
      Joi.string().uri().messages({
        "string.uri": "Each product image must be a valid URI",
        "string.base": "Each product image must be a string",
      })
    )
    .messages({
      "array.base": "Product images must be an array of URIs",
    }),

  description: Joi.string().allow("", null).messages({
    "string.base": "Description must be a string",
  }),

  stockStatus: Joi.string()
    .valid("in-stock", "out-of-stock", "low-stock")
    .messages({
      "any.only":
        "Stock status must be one of: in-stock, out-of-stock, or low-stock",
      "string.base": "Stock status must be a string",
    }),
});

exports.productUpdateSchema = Joi.object({
  productName: Joi.string().min(2).max(100).required().messages({
    "string.base": "Product name must be a string",
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 2 characters long",
    "string.max": "Product name must not exceed 100 characters",
    "any.required": "Product name is required",
  }),

  brand: Joi.alternatives()
    .try(JoiObjectId(), Joi.string().min(2).max(20))
    .required()
    .messages({
      "alternatives.match": "Brand must be a valid brand ID or name",
      "any.required": "Brand is required",
    }),

  cost: Joi.number().min(0).required().messages({
    "number.base": "Cost must be a number",
    "number.min": "Cost cannot be negative",
    "any.required": "Cost is required",
  }),

  productImages: Joi.array()
    .items(
      Joi.string().uri().messages({
        "string.uri": "Each product image must be a valid URI",
        "string.base": "Each product image must be a string",
      })
    )
    .messages({
      "array.base": "Product images must be an array of URIs",
    }),

  description: Joi.string().allow("", null).messages({
    "string.base": "Description must be a string",
  }),

  stockStatus: Joi.string()
    .valid("in-stock", "out-of-stock", "low-stock")
    .messages({
      "any.only":
        "Stock status must be one of: in-stock, out-of-stock, or low-stock",
      "string.base": "Stock status must be a string",
    }),
});

exports.brandSchema = Joi.object({
  brandName: Joi.string().trim().min(2).max(20).required().messages({
    "string.base": "Brand name must be a string",
    "string.empty": "Brand name is required",
    "string.min": "Brand name must be at least 2 characters long",
    "string.max": "Brand name must not exceed 20 characters",
    "any.required": "Brand name is required",
  }),
});

exports.updateBrandSchema = Joi.object({
  brandName: Joi.string().min(2).max(20).optional().messages({
    "string.base": "Brand name must be a string",
    "string.empty": "Brand name is required",
    "string.min": "Brand name must be at least 2 characters long",
    "string.max": "Brand name must not exceed 20 characters",
    "any.required": "Brand name is required",
  }),
});
