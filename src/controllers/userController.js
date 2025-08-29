const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const Order = require("../models/orderModel");

exports.getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return next(new AppError("User not found"));

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.getOrderHistory = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  // Only admins see all orders, customers see only theirs
  const query = req.user.role === "admin" ? {} : { customerId: req.user._id };

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: [
      {
        path: "items.productId",
        select: "productName cost productImages",
      },
      {
        path: "customerId",
        select: "fullName email",
      },
    ],
  };

  const orders = await Order.paginate(query, options);

  // Customize response depending on role
  let responseOrders;
  if (req.user.role === "admin") {
    responseOrders = orders.docs.map((order) => ({
      orderId: order.orderId,
      customer: {
        fullName: order.customerId?.fullName,
        email: order.customerId?.email,
      },
      items: order.items.map((item) => ({
        productName: item.productId?.productName,
        cost: item.productId?.cost,
        quantity: item.quantity,
      })),
      totalOrderCost: order.totalOrderCost,
      shippingStatus: order.shippingStatus,
      createdAt: order.createdAt,
    }));
  } else {
    // customer only sees their own details
    responseOrders = orders.docs.map((order) => ({
      orderId: order.orderId,
      items: order.items.map((item) => ({
        productName: item.productId?.productName,
        cost: item.productId?.cost,
        quantity: item.quantity,
      })),
      totalOrderCost: order.totalOrderCost,
      shippingStatus: order.shippingStatus,
      createdAt: order.createdAt,
    }));
  }

  res.status(200).json({
    status: "success",
    results: responseOrders.length,
    pagination: {
      totalDocs: orders.totalDocs,
      totalPages: orders.totalPages,
      currentPage: orders.page,
      hasNextPage: orders.hasNextPage,
      hasPrevPage: orders.hasPrevPage,
    },
    data: { orders: responseOrders },
  });
});
