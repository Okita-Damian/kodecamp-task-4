const express = require("express");
const router = express.Router();
const { createBrand } = require("../controllers/brandContoller");
const { authenticate, restrictTo } = require("../middlewares/auth");

router.post("/", authenticate, restrictTo("admin"), createBrand);

module.exports = router;
