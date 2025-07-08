const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, unique: true },
  teacherName: { type: String, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  education: { type: String, required: true },
  phone: { type: String, required: true },
  emergency: { type: String, required: true },
  fixedSalary: { type: Number, default: null },
  active: { type: Boolean, default: true }, 
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }]
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
