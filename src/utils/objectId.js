const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message(`"${value}" is not a valid MongoDB ObjectId`);
  }
  return value;
};

module.exports = objectIdValidator;
