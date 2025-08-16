const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require("../validation/orderValidation");
const { authenticate, restrictTo } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

router.post(
  "/",
  authenticate,
  restrictTo("customer"),
  validate(createOrderSchema),
  orderController.createOrder
);

router.patch(
  "/:id/status",
  authenticate,
  restrictTo("admin"),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

router.get(
  "/",
  authenticate,
  restrictTo("admin"),
  orderController.getAllOrders
);

router.get(
  "/:id",
  authenticate,
  restrictTo("admin"),
  orderController.getOrderById
);

router.get(
  "/my-orders",
  authenticate,
  restrictTo("customer"),
  orderController.getMyOrders
);

module.exports = router;
