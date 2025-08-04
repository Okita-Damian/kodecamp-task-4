const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  brandSchema: {
    type: String,
    required: [true, "Brand name is required"],
    trim: true,
    unique: true,
  },
});

module.exports = mongoose.model("Brand", brandSchema);
