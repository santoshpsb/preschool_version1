const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  placeOfBirth: String,
  nationality: String,
  firstLanguage: String,
  otherLanguages: [String],

  address: {
    location: String,
    city: String,
    state: String,
    country: String,
    pincode: { type: String },
  },

  father: {
    fullName: String,
    email: { type: String },     
    education: String,
    profession: String,
    companyName: String,
    designation: String,
    phone: { type: String },     
  },

  mother: {
    fullName: String,
    email: { type: String },
    education: String,
    profession: String,
    companyName: String,
    designation: String,
    phone: { type: String },
  },

  guardian: {
    fullName: String,
    email: { type: String },
    relationWithStudent: String,
    phone: { type: String },
  },

  classRef: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  active: { type: Boolean, default: true },
  feeRef: { type: mongoose.Schema.Types.ObjectId, ref: "Fee" },

});

module.exports = mongoose.model("Student", studentSchema);
