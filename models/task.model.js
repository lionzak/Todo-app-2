const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  isChecked: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Task", taskSchema);
