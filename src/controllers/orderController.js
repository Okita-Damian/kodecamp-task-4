const Joi = require("joi");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/appError");
const objectIdValidator = require("../utils/objectIdValidator");

// Create order (customer only)
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError("Order items are required", 400));
  }

  // Extract product IDs from items
  const productIds = items.map((item) => item.productId);

  // Find all valid product IDs from DB
  const validProducts = await Product.find({ _id: { $in: productIds } });

  if (validProducts.length !== productIds.length) {
    return next(new AppError("One or more product IDs are invalid", 400));
  }

  // calculate total cost dynamically from DB
  let totalCost = 0;
  items.forEach((item) => {
    const product = validProducts.find(
      (p) => p._id.toString() === item.productId.toString()
    );
    if (product) {
      totalCost += product.cost * item.quantity;
    }
  });

  // Create order
  const order = await Order.create({
    customerId: req.user._id,
    products: items,
    totalCost,
    shippingStatus: "pending",
  });

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    data: order,
  });
});

// Get all orders with pagination + filtering (Admin only)
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status, productName } = req.query;

  const query = {};
  if (status) query.status = status;

  let productFilter = {};
  if (productName) {
    productFilter = {
      "products.productId": {
        $in: await Product.find({
          productName: { $regex: productName, $options: "i" },
        }).distinct("_id"),
      },
    };
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find({ ...query, ...productFilter })
    .populate("customerId")
    .populate("products.productId")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments({ ...query, ...productFilter });

  res.status(200).json({
    status: "success",
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    results: orders.length,
    data: orders,
  });
});

const idSchema = Joi.object({
  id: Joi.string().custom(objectIdValidator).required(),
});

// Admin & customer: view a single order
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const { error } = idSchema.validate({ id: req.params.id });
  if (error) return next(new AppError(error.message, 400));

  const order = await Order.findById(req.params.id)
    .populate("customerId")
    .populate("products.productId");

  if (!order) return next(new AppError("Order not found", 404));

  res.status(200).json({ status: "success", data: order });
});

// Get logged-in customer's orders
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, productName, status } = req.query;

  const query = { customerId: req.user._id };
  if (status) query.status = status;

  let productFilter = {};
  if (productName) {
    productFilter = {
      "products.productId": {
        $in: await Product.find({
          productName: { $regex: productName, $options: "i" },
        }).distinct("_id"),
      },
    };
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find({ ...query, ...productFilter })
    .populate("products.productId")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments({ ...query, ...productFilter });

  res.status(200).json({
    status: "success",
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    results: orders.length,
    data: orders,
  });
});

// Admin: update shipping status
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { shippingStatus: req.body.shippingStatus },
    { new: true }
  );

  if (!order) return next(new AppError("Order not found", 404));

  res.status(200).json({
    status: "success",
    data: order,
    message: "Order status updated successfully",
  });
});
