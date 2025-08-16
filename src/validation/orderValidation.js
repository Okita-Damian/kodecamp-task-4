const Joi = require("joi");
const objectIdValidator = require("../utils/objectIdValidator");

// Schema for creating an order (customer)
const createOrderSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        productName: Joi.string().trim().required(),
        productId: Joi.string().custom(objectIdValidator).required(),
        quantity: Joi.number().integer().min(1).required(),
        totalCost: Joi.number().positive().required(),
      })
    )
    .min(1)
    .required(),
});

// Schema for updating order status (Admin only)
const updateOrderStatusSchema = Joi.object({
  shippingStatus: Joi.string()
    .valid("pending", "shipped", "delivered")
    .required(),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};
