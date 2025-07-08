const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    class_id: { type: String, required: true, unique: true },
    class_name: { type: String, required: true },
    section: { type: String, required: true },
    no_of_students: { type: Number, default: 0 },
    threshold: { type: Number, required: true },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
  },
  {
    collection: "class" // 👈 This tells Mongoose to use the "class" collection exactly
  }
);

module.exports = mongoose.model("Class", classSchema);
