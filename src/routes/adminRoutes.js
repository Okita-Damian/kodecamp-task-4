const express = require("express");
const { authenticate, restrictTo } = require("../middlewares/auth");
const { createUserByAdmin } = require("../controllers/adminController");

const router = express.Router();

router.post(
  "/create-admin",
  authenticate,
  restrictTo("admin"),
  createUserByAdmin
);

module.exports = router;
