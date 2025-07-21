const Product = require("../models/productModel");
const {
  productSchema,
  productUpdateSchema,
} = require("../validation/productValidation");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/appError");

// Create a new product
exports.createProduct = asyncHandler(async (req, res, next) => {
  const { error, value } = productSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const product = await Product.create({
    ...value,
    ownerId: req.user.id,
  });
  res.status(201).json({
    status: "success",
    data: product,
  });
});

// Get all products with pagination
exports.getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const products = await Product.find()
    .populate("ownerId", "fullName email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 }); // sort by newest first

  const totalProducts = await Product.countDocuments();

  res.status(200).json({
    status: "success",
    results: products.length,
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: page,
    data: products,
  });
});

// Get product by ID
exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate(
    "ownerId",
    "fullName email"
  );

  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({ status: "success", data: product });
});

// Update the product
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { error, value } = productUpdateSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found", 404));

  if (product.ownerId.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new AppError("You do not have permission to perform this action", 403)
    );
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: updatedProduct,
  });
});

// Delete the product by ID
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found", 404));

  if (product.ownerId.toString() !== req.user.id && req.user.role !== "admin")
    return next(
      new AppError("You do not have permission to perform this action", 403)
    );

  await product.deleteOne();

  res.status(204).send();
});
