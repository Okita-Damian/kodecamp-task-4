const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { authenticate, restrictTo } = require("../middlewares/auth");

router.post(
  "/",
  authenticate,
  restrictTo("admin"),
  brandController.createBrand
);

router.get("/:id", brandController.getBrandById);

router.get("/", brandController.getAllBrands);

router.put(
  "/:id",
  authenticate,
  restrictTo("admin"),
  brandController.updateBrand
);

router.delete(
  "/:id",
  authenticate,
  restrictTo("admin"),
  brandController.deleteBrand
);
module.exports = router;
