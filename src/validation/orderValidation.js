const BaseJoi = require("joi");
const JoiObjectId = require("joi-objectid")(BaseJoi);
const Joi = BaseJoi;

// Create order (customer)
const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: JoiObjectId().required().messages({
          "any.required": "Product ID is required",
          "string.pattern.name": "Invalid Product ID",
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
  orderId: Joi.string().required().messages({
    "string.base": "Order ID must be a string",
    "string.empty": "Order ID is required",
  }),
  shippingStatus: Joi.string()
    .valid("pending", "shipped", "delivered")
    .required()
    .messages({
      "any.only": "Shipping status must be one of: pending, shipped, delivered",
      "string.empty": "Shipping status is required",
    }),
});

// Adimin get order by Id
const getOrderSchema = Joi.object({
  id: JoiObjectId().required().messages({
    "any.required": "Order ID is required",
    "string.pattern.name": "Invalid Order ID",
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrderSchema,
};
