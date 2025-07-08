const express = require("express");
const router = express.Router();
const Class = require("../models/Class");

const verifyToken = require("../middleware/authMiddleware");


// Check if class has available space
router.get("/availability", verifyToken,async (req, res) => {
  const { className, section } = req.query;

  try {
    const classDoc = await Class.findOne({ class_name: className, section });
     const firstClass = await Class.findOne(); 
    if (!classDoc) {
      return res.status(404).json({ available: false, message: "Class not found" });
    }

    const hasSpace = classDoc.no_of_students < classDoc.threshold;

    res.json({
      available: hasSpace,
      classId: classDoc.class_id,
      message: hasSpace ? "Space available" : "Class is full",
    });
  } catch (err) {
    res.status(500).json({ available: false, error: err.message });
  }
});

module.exports = router;
