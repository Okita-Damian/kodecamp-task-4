const Brand = require("../models/brandModel");
const {
  brandSchema,
  updateBrandSchema,
} = require("../validation/productValidation");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/appError");

//creating a new brand
exports.createBrand = asyncHandler(async (req, res, next) => {
  const { error, value } = brandSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const brandExist = await Brand.findOne({ brandName: value.brandName });
  if (brandExist) return next(new AppError("brand name already exist"));

  const newbrand = await Brand.create({ ...value });

  res.status(200).json({
    status: "success",
    data: newbrand,
  });
});

//Get brand by ID
exports.getBrandById = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) return next(new AppError("brand not found", 404));

  res.status(200).json({
    status: "success",
    data: brand,
  });
});

exports.getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find();
  res.status(200).json({
    status: "success",
    result: brands.length,
    data: brands,
  });
});

exports.updateBrand = asyncHandler(async (req, res, next) => {
  const { error, value } = updateBrandSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const brand = await Brand.findById(req.params.id);
  if (!brand) return next(new AppError("Brand not found", 404));

  const updateBrand = await Brand.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: updateBrand,
  });
});

exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) return next(new AppError("Brand not found", 404));

  if (req.user.role !== "admin") {
    return next(new AppError("You don't have permission to this action", 403));
  }

  await Brand.deleteOne({ _id: req.params.id });

  res.status(204).send();
});
