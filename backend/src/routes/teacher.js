const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");

const verifyToken = require("../middleware/authMiddleware");
router.use(verifyToken);

// GET paginated teachers with class name and section
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const total = await Teacher.countDocuments({ active: true });

    const teachers = await Teacher.find({ active: true }).skip(skip).limit(limit).populate({
      path: "classes",
      select: "class_name section -_id",
    });

    res.json({
      teachers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get teacher by ID
// GET /api/teachers/search/:teacherId
router.get("/search/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const teacher = await Teacher.findOne({ teacherId, active: true }).populate("classes"); // if using refs
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Convert class IDs to class_name + section if needed
    const classesWithNames = teacher.classes.map((cls) => ({
      class_name: cls.class_name || "Unknown",
      section: cls.section || "?",
    }));

    res.json({ teacher: { ...teacher.toObject(), classes: classesWithNames } });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add new teacher
router.post("/", async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth();

    // Determine academic year
    const academicYear = month < 5 ? now.getFullYear() - 1 : now.getFullYear();
    const yearPrefix = String(academicYear).slice(-2);

    // Count existing teachers with same year prefix in teacherId
    const count = await Teacher.countDocuments({
      teacherId: { $regex: `^${yearPrefix}T` },
    });

    const teacherNumber = String(count + 1).padStart(3, "0"); // → '001', '002', ...
    const teacherId = `${yearPrefix}T${teacherNumber}`;

    const {
      teacherName,
      gender,
      email,
      education,
      phone,
      emergency,
      fixedSalary,
      classes = [],
    } = req.body;

    // Deduplicate class IDs
    const uniqueClassIds = [...new Set(classes)];

    // Fetch class _ids based on class_id strings
    const classDocs = await Class.find({ class_id: { $in: uniqueClassIds } });

    if (classDocs.length !== uniqueClassIds.length) {
      return res
        .status(400)
        .json({ error: "One or more class_id values are invalid." });
    }

    const classObjectIds = classDocs.map((cls) => cls._id);

    const payload = {
      teacherId,
      teacherName,
      gender,
      email,
      education,
      phone,
      emergency,
      fixedSalary: fixedSalary !== undefined ? fixedSalary : null, // null if not provided
      active: true, // default to active
      classes: classObjectIds,
    };

    console.log("Creating Teacher:", payload);

    const teacher = new Teacher(payload);
    await teacher.save();

    res.status(201).json({ message: "Teacher added successfully", teacher });
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(400).json({ error: error.message });
  }
});

//update teacher
router.put("/:id", async (req, res) => {
  try {
    const teacherId = req.params.id;
    const { classes, ...otherFields } = req.body;

     const updatePayload = {
      ...otherFields, // includes fixedSalary, active, and others
    };

    // Handle class update only if classes are passed
    if (classes && Array.isArray(classes)) {
      const classDocs = await Promise.all(
        [...new Set(classes)].map(async (classId) => {
          const cls = await Class.findOne({ class_id: classId });
          if (!cls) throw new Error(`Class not found for id ${classId}`);
          return cls._id;
        })
      );
      updatePayload.classes = classDocs;
    }

   
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      updatePayload,
      { new: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({
      message: "Teacher updated successfully",
      teacher: updatedTeacher,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// DELETE /api/teachers/:id
router.delete("/:id", async (req, res) => {
  try {
    const updated = await Teacher.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({ message: "Teacher marked as inactive", teacher: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
