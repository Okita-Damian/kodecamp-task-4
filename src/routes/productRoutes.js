const express = require("express");
const router = express.Router();

const ProductController = require("../controllers/productController");
const { authenticate, restrictTo } = require("../middlewares/auth");

router.get("/", ProductController.getAllProducts);

router.get("/:id", ProductController.getProductById);

router.post(
  "/",
  authenticate,
  restrictTo("admin"),
  ProductController.createProduct
);

router.put("/:id", authenticate, ProductController.updateProduct);

router.delete(
  "/:id",
  authenticate,
  restrictTo("admin"),
  ProductController.deleteProduct
);

module.exports = router;
