const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Brand name is required"],
      lowercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brand", BrandSchema);
