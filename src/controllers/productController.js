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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const options = {
    page,
    limit,
    populate: { path: "brand", select: "brandName" },
    sort: { createdAt: -1 },
  };

  const result = await Product.paginate({}, options);

  res.status(200).json({
    status: "success",
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    currentPage: result.page,
    results: result.docs.length,
    data: result.docs,
  });
});

// Get all product by Brand
exports.getProductsByBrand = asyncHandler(async (req, res, next) => {
  const { brand, page, limit } = req.params;

  let brandFilter;

  // Check if brand is an ID or brandName
  if (brand.match(/^[0-9a-fA-F]{24}$/)) {
    brandFilter = { brand };
  } else {
    const brandDoc = await Brand.findOne({
      brandName: new RegExp(`^${brand}$`, "i"),
    });
    if (!brandDoc) {
      return next(new AppError("Brand not found", 404));
    }
    brandFilter = { brand: brandDoc._id };
  }

  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    populate: { path: "brand", select: "brandName" },
    sort: { createdAt: -1 },
  };

  const result = await Product.paginate(brandFilter, options);

  res.status(200).json({
    status: "success",
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    currentPage: result.page,
    results: result.docs.length,
    data: result.docs,
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
