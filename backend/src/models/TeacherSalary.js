const mongoose = require('mongoose');

const teacherSalarySchema = new mongoose.Schema({
  teacherId: { type: String, required: true }, 
  salaryMonth: { type: Date, required: true },
  workingDays: { type: Number, required: true },
  fullAbsents: { type: Number, required: true },
  halfAbsents: { type: Number, required: true },
  salaryPaid: { type: Number, required: true },
  totalPresentDays: { type: Number, required: true },
  totalAbsentDays: { type: Number, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeacherSalary', teacherSalarySchema);

