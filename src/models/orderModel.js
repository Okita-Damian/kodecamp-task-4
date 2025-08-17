const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Product = require("../models/productModel");
const crypto = require("crypto");
const AppError = require("../utils/appError");

// Sub-schema for order items
const orderItemSchema = new mongoose.Schema({
  productName: {
    type: String,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
  },
  quantity: { type: Number, required: true, min: 1 },
  totalCost: { type: Number },
});

// Main Order schema
const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
    },
    items: {
      type: [orderItemSchema],
      validate: [
        (v) => Array.isArray(v) && v.length > 0,
        "Order must have at least one item",
      ],
    },
    orderId: { type: String, unique: true },
    shippingStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//  auto-fill productName and totalCost
orderSchema.pre("save", async function (next) {
  try {
    if (!this.orderId) {
      this.orderId = `ORD-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;

      for (let item of this.items) {
        const product = await Product.findById(item.productId);
        if (!product)
          return next(
            new AppError(`Product not found: ${item.productId}`, 404)
          );

        item.productId = product.productName;
        item.ownerId = product.ownerId;
        if (!item.ownerId)
          return next(
            new AppError(`Product has no owner: ${item.productName}`, 400)
          );
        item.totalCost = item.quantity * product.cost;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Virtual field: total order cost
orderSchema.virtual("totalOrderCost").get(function () {
  return this.items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
});

// Pagination plugin
orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Order", orderSchema);
