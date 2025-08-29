const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
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

  let brand;

  if (/^[0-9a-fA-F]{24}$/.test(value.brand)) {
    brand = await Brand.findById(value.brand);
  } else {
    brand = await Brand.findOne({
      brandName: new RegExp(`^${value.brand}$`, "i"),
    });
  }
  if (!brand) return next(new AppError("Brand not found", 404));

  const existingProduct = await Product.findOne({
    productName: new RegExp(`^${value.productName}$`, "i"),
    brand: brand._id,
  });
  if (existingProduct) {
    return next(
      new AppError(
        "Product with this name already exists under this brand",
        409
      )
    );
  }

  const product = await Product.create({
    ...value,
    brand: brand._id,
    ownerId: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: product,
  });
});

// GET filteredProducts
exports.getFilteredProducts = asyncHandler(async (req, res, next) => {
  const { brand, page = 1, limit = 10 } = req.query;

  const filter = {};

  // Handle brand filter (via name or ObjectId)
  if (brand) {
    let brandDoc;
    if (/^[0-9a-fA-F]{24}$/.test(brand)) {
      brandDoc = await Brand.findById(brand);
    } else {
      brandDoc = await Brand.findOne({
        brandName: new RegExp(`^${brand}$`, "i"),
      });
    }

    if (!brandDoc) {
      return next(new AppError("Brand not found", 404));
    }

    filter.brand = brandDoc._id;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: { path: "brand", select: "brandName" },
    sort: { createdAt: -1 },
  };

  const result = await Product.paginate(filter, options);

  res.status(200).json({
    status: "success",
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    currentPage: result.page,
    results: result.docs.length,
    data: result.docs,
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

  if (value.brand) {
    let brand;

    if (/^[0-9a-fA-F]{24}$/.test(value.brand)) {
      brand = await Brand.findById(value.brand);
    } else {
      brand = await Brand.findOne({
        brandName: new RegExp(`^${value.brand}$`, "i"),
      });
    }

    if (!brand) return next(new AppError("Brand not found", 404));

    value.brand = brand._id;
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
