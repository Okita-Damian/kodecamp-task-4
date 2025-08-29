const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, restrictTo } = require("../middlewares/auth");

// user get their own profile
router.get("/", authenticate, userController.getMyProfile);

router.get("/order-history", authenticate, userController.getOrderHistory);

module.exports = router;
