const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/appError");
const {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrderSchema,
} = require("../validation/orderValidation");

// Create order (customer only)
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { error, value } = createOrderSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  // Create order
  const order = await Order.create({
    customerId: req.user._id,
    items: value.items,
  });

  await order.populate("items.productId");

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    orderId: order.orderId,
    totalOrderCost: order.totalOrderCost,
    data: order,
  });
});

// Get all orders with pagination + filtering (Admin only)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, productName } = req.query;

  const query = {};
  if (status) query.status = status;

  let productFilter = {};
  if (productName) {
    productFilter = {
      "items.productId": {
        $in: await Product.find({
          productName: { $regex: productName, $options: "i" },
        }).distinct("_id"),
      },
    };
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find({ ...query, ...productFilter })
    .populate("customerId")
    .populate("items.productId")
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
    data: orders.map((order) => ({
      orderId: order.orderId,
      totalOrderCost: order.totalOrderCost,
      ...order.toObject(),
    })),
  });
});

// Admin & customer: view a single order
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const { error } = getOrderSchema.validate({ id: req.params.id });
  if (error) return next(new AppError(error.message, 400));

  const order = await Order.findById(req.params.id)
    .populate("customerId")
    .populate("items.productId");

  if (!order) return next(new AppError("Order not found", 404));

  res.status(200).json({
    status: "success",
    data: {
      orderId: order.orderId,
      totalOrderCost: order.totalOrderCost,
      ...order.toObject(),
    },
  });
});

// Get logged-in customer's orders
exports.getMyOrders = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const customerId = req.user._id;

  const order = await Order.findOne({ orderId, customerId }).populate(
    "items.productId"
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found for this customer",
    });
  }
  res.status(200).json({
    success: true,
    data: {
      orderId: order.orderId,
      totalOrderCost: order.totalOrderCost,
      shippingStatus: order.shippingStatus,
      items: order.items.map((i) => ({
        productId: i.productId._id,
        productName: i.productName || i.productId.productName,
        quantity: i.quantity,
        totalCost: i.totalCost,
        ownerId: i.ownerId,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
  });
});

// Admin: update shipping status
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { error, value } = updateOrderStatusSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) return next(new AppError(error.details[0].message, 400));

  const order = await Order.findOne({ orderId: value.orderId });
  if (!order)
    return next(new AppError(`No order found with ID: ${value.orderId}`, 404));

  order.shippingStatus = value.shippingStatus;
  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    order,
  });
});
