const mongoose = require("mongoose");

const EnrollFeeSchema = new mongoose.Schema({
  studentId: {
    type: String,

    required: true,

    ref: "Student",
  },

  tuitionFee: {
    type: Number,

    required: true,
  },

  admissionFee: {
    type: Number,

    required: true,
  },

  processingFee: {
    type: Number,

    required: true,
  },

  discount: {
    type: Number,

    default: 0,
  },

  createdAt: {
    type: Date,

    default: Date.now,
  },
});

module.exports = mongoose.model("EnrollFee", EnrollFeeSchema);
