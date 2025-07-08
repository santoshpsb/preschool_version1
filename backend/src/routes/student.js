const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Class = require("../models/Class");
const Teacher = require("../models/Teacher");

const verifyToken = require("../middleware/authMiddleware");
router.use(verifyToken);

const schoolNameMap = {
  "PlayGroup": "PG",
  "Nursery": "NU",
  "Pre Kindergarten": "PK",
  "Kindergarten": "KG",
  "DayCare": "DC",
};


//Api to add new student
router.post("/", async (req, res) => {
  try {
    const { class_id,studentId,...studentData } = req.body;
    const classDoc = await Class.findOne({ class_id });

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classDoc.no_of_students >= classDoc.threshold) {
      return res.status(400).json({ message: "Class is full" });
    }

    const now = new Date();
    const month = now.getMonth(); // Jan = 0
    const fullYear = month >= 5 ? now.getFullYear() : now.getFullYear() - 1;
    const academicYear = String(fullYear).slice(-2); 

    const count = await Student.countDocuments({
      studentId: { $regex: `^${academicYear}W` }
    });

   const studentNumber = String(count + 1).padStart(4, "0"); // 0001 format
    const stuId = `${academicYear}W${studentNumber}`;

    const newStudent = new Student({
      ...studentData,
      studentId:stuId,
      classRef: classDoc._id,
      active: true
    });
    

    await newStudent.save();
    classDoc.no_of_students += 1;
    await classDoc.save();

    res.status(201).json({ message: "Student added", student: newStudent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



//Api to get all students
router.get("/all", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  try {
    const students = await Student.find({ active: true })
      .sort({ studentId: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("classRef");

    const results = [];

    for (const student of students) {
      const classDoc = student.classRef;

      const teacherList = await Teacher.find({ classes: classDoc._id });

      const contactPerson =
        student.father?.fullName && student.father?.phone
          ? { name: student.father.fullName, phone: student.father.phone }
          : student.mother?.fullName && student.mother?.phone
          ? { name: student.mother.fullName, phone: student.mother.phone }
          : { name: student.guardian?.fullName, phone: student.guardian?.phone };

      // Return full student data and append additional context
      results.push({
        ...student.toObject(), // full student document
        className: classDoc.class_name,
        section: classDoc.section,
        contactName: contactPerson?.name || "-",
        contactPhone: contactPerson?.phone || "-",
        teachers: teacherList.map((t) => ({
          teacherId: t.teacherId,
          teacherName: t.teacherName,
        })),
      });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});



// Deactivate student (set active = false) and decrement class no_of_students
router.put("/deactivate/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // If already inactive, don't proceed
    if (!student.active) {
      return res.status(400).json({ message: "Student already inactive" });
    }

    // Set student as inactive
    student.active = false;
    await student.save();

    // Update class document
    await Class.findByIdAndUpdate(student.classRef, {
      $inc: { no_of_students: -1 },
    });

    res.json({ message: "Student deactivated and class count updated" });
  } catch (error) {
    console.error("Error deactivating student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


//Api to update a student data
router.put("/:id", async (req, res) => {
  try {
    const studentMongoId = req.params.id;
    const {
      class_id,
      ...updatedData
    } = req.body;


    const new_class_id = class_id;
    console.log("Incoming request body:", req.body);

    // Fetch existing student
    const student = await Student.findById(studentMongoId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const oldClassId = student.classRef?.toString();

    // Find new class document by class_id
    const newClassDoc = await Class.findOne({ class_id:new_class_id });
    if (!newClassDoc) return res.status(404).json({ message: "New class not found" });

    const newClassId = newClassDoc._id.toString();

    // Check if class has changed
    if (oldClassId !== newClassId) {
      if (newClassDoc.no_of_students >= newClassDoc.threshold) {
        return res.status(400).json({ message: "New class is full" });
      }

      // Update classRef
      student.classRef = newClassDoc._id;

      // Update class student counts
      await Class.findByIdAndUpdate(oldClassId, { $inc: { no_of_students: -1 } });
      await Class.findByIdAndUpdate(newClassId, { $inc: { no_of_students: 1 } });


    }

    // Remove frontend-only fields (including classRef object just in case)
    const frontendFields = [
      "_id", "__v", "teachers", "className", "section",
      "contactName", "contactPhone", "admissionSeeking", "class_id"
    ];
    frontendFields.forEach(field => delete updatedData[field]);

    // Merge and save updated data
    Object.assign(student, updatedData);
    student.classRef = newClassDoc._id; 
    await student.save();

    // Return updated student with populated classRef
    const updatedStudent = await Student.findById(student._id).populate("classRef");

    return res.json({ message: "Student updated successfully", student: updatedStudent });

  } catch (err) {
    console.error("Error updating student:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});




// GET /api/students/search?id=...
router.get("/search", async (req, res) => {
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "ID is required" });

  try {
    const student = await Student.findOne({ studentId: id, active: true })
      .populate("classRef")
      .lean();

    if (!student) return res.status(404).json({ error: "Student not found" });

    // get class info
    student.className = student.classRef.class_name;
    student.section = student.classRef.section;

    // find all teachers of that class
    const teachers = await Teacher.find({ classes: student.classRef._id })
      .select("teacherId teacherName")
      .lean();
    student.teachers = teachers;

    // fallback for contact
    const contact =
      student.father?.fullName && student.father?.phone
        ? student.father
        : student.mother?.fullName && student.mother?.phone
        ? student.mother
        : student.guardian;

    student.contactName = contact?.fullName || "N/A";
    student.contactPhone = contact?.phone || "N/A";

    return res.json(student);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
