const { body } = require("express-validator");


const validationSchema = [
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 3 })
    .withMessage("Content must be at least 3 characters long"),
];

module.exports = {validationSchema};