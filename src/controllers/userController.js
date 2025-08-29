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

  let query = {};
  if (req.user.role !== "admin") {
    // Customers only see their own orders
    query = { customerId: req.user._id };
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: [{ path: "customerId", select: "fullName email" }],
  };

  const orders = await Order.paginate(query, options);

  res.status(200).json({
    status: "success",
    results: orders.docs.length,
    pagination: {
      totalDocs: orders.totalDocs,
      totalPages: orders.totalPages,
      currentPage: orders.page,
      hasNextPage: orders.hasNextPage,
      hasPrevPage: orders.hasPrevPage,
    },
    data: { orders: orders.docs },
  });
});
