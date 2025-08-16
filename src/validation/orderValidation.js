const BaseJoi = require("joi");
const JoiObjectId = require("joi-objectid")(BaseJoi);
const Joi = BaseJoi;

// Schema for creating an order
const createOrderSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        productName: Joi.string().trim().required(),
        productId: JoiObjectId().required(), // validated ObjectId
        quantity: Joi.number().integer().min(1).required(),
        totalCost: Joi.number().positive().required(),
        shippingStatus: Joi.string()
          .valid("pending", "shipped", "delivered")
          .required(),
      })
    )
    .min(1)
    .required(),
});

// Schema for updating order status
const updateOrderStatusSchema = Joi.object({
  shippingStatus: Joi.string()
    .valid("pending", "shipped", "delivered")
    .required(),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};
