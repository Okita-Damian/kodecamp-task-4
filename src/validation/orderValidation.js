// const Joi = require("joi");
// const objectIdValidator = require("../utils/objectIdValidator");
const BaseJoi = require("joi");
const JoiObjectId = require("joi-objectid")(BaseJoi);
const Joi = BaseJoi;

// Create order (customer)
const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().custom(JoiObjectId).required().messages({
          "any.required": "Product ID is required",
          "any.invalid": "Invalid Product ID",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.base": "Quantity must be a number",
          "number.min": "Quantity must be at least 1",
          "any.required": "Quantity is required",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Items must be an array",
      "array.min": "You must provide at least 1 item",
      "any.required": "Items are required",
    }),
});

// Update shipping status (admin)
const updateOrderStatusSchema = Joi.object({
  shippingStatus: Joi.string()
    .valid("pending", "shipped", "delivered")
    .required()
    .messages({
      "any.only": "Shipping status must be one of: pending, shipped, delivered",
      "any.required": "Shipping status is required",
    }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};
