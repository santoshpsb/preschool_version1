const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const TeacherSalary = require("../models/TeacherSalary");
const Teacher = require("../models/Teacher");

const verifyToken = require("../middleware/authMiddleware");
router.use(verifyToken);


// @route   POST /api/salary
// @desc    Add a new salary record for a teacher (with internal calculation)
router.post("/", async (req, res) => {
  try {
    const { teacherId, salaryMonth, workingDays, fullAbsents, halfAbsents } =
      req.body;

    // Validate teacher
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    if (!teacher.fixedSalary) {
      return res
        .status(400)
        .json({ error: "Fixed salary not set for this teacher" });
    }

    // Normalize salaryMonth to first day of month
    const normalizedMonth = new Date(salaryMonth);
    normalizedMonth.setDate(1);

    // Calculate salary
    const perDay = teacher.fixedSalary / workingDays;
    const totalAbsentDays = fullAbsents + halfAbsents * 0.5;
    const totalPresentDays = workingDays - totalAbsentDays;
    const totalDeduction = fullAbsents * perDay + (halfAbsents * perDay) / 2;
    const salaryPaid = Math.round(teacher.fixedSalary - totalDeduction);

    // Create salary record
    const salaryRecord = new TeacherSalary({
      teacherId: teacher.teacherId,
      salaryMonth: normalizedMonth,
      workingDays,
      fullAbsents,
      halfAbsents,
      salaryPaid,
      totalAbsentDays,
      totalPresentDays,
    });

    await salaryRecord.save();

    res.status(201).json({
      message: "Salary record saved successfully",
      data: salaryRecord,
    });
  } catch (error) {
    console.error("Error saving salary record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// @route   GET /api/teacherSalary/check/:teacherId
// @desc    Return teacherName if teacher exists
router.get("/check/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { month } = req.query;

    // Validate month format
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        error: "Invalid or missing 'month' query parameter (format: YYYY-MM)",
      });
    }

    // Find active teacher
    const teacher = await Teacher.findOne({ teacherId, active: true });
    if (!teacher) {
      return res.status(404).json({
        exists: false,
        message: "Teacher not found or not active",
      });
    }

    // Normalize salaryMonth
    const normalizedMonth = new Date(`${month}-01`);
    normalizedMonth.setUTCHours(0, 0, 0, 0);

    // Check if salary already exists
    const existingSalary = await TeacherSalary.findOne({
      teacherId,
      salaryMonth: normalizedMonth,
    });

    if (existingSalary) {
      return res.status(409).json({
        exists: true,
        teacherName: teacher.teacherName,
        error: "Salary for this month has already been added",
      });
    }

    // OK to proceed
    return res.json({
      exists: true,
      teacherName: teacher.teacherName,
      alreadyAdded: false,
    });
  } catch (error) {
    console.error("Error checking teacher or salary record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/teacherSalary/view/:year/:month?page=1&limit=25
router.get("/view/:year/:month", async (req, res) => {
  const { year, month } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const skip = (page - 1) * limit;

    // Total count for pagination
    const total = await TeacherSalary.countDocuments({
      salaryMonth: { $gte: startDate, $lt: endDate },
    });

    // Sorted by teacherId (ascending)
    const salaryRecords = await TeacherSalary.find({
      salaryMonth: { $gte: startDate, $lt: endDate },
    })
      .sort({ teacherId: 1 })
      .skip(skip)
      .limit(limit);

    // Get teacher info
    const teacherIds = salaryRecords.map((rec) => rec.teacherId);
    const teacherDocs = await Teacher.find({ teacherId: { $in: teacherIds } });

    const teacherMap = {};
    teacherDocs.forEach((t) => {
      teacherMap[t.teacherId] = {
        teacherName: t.teacherName,
        fixedSalary: t.fixedSalary || 0,
      };
    });

    const response = salaryRecords.map((rec) => {
      const teacher = teacherMap[rec.teacherId] || {};
      const presentDays =
        rec.workingDays - rec.fullAbsents - 0.5 * rec.halfAbsents;

      return {
        teacherId: rec.teacherId,
        teacherName: teacher.teacherName || "Unknown",
        workingDays: rec.workingDays,
        fullAbsents: rec.fullAbsents,
        halfAbsents: rec.halfAbsents,
        presentDays: parseFloat(presentDays.toFixed(1)),
        monthlySalary: teacher.fixedSalary,
        salaryToBePaid: rec.salaryPaid,
      };
    });

    res.json({
      data: response,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching salary data:", err);
    res.status(500).json({ error: "Server error fetching salary records." });
  }
});

//get pdf generation for month wise salary
// GET /api/teacherSalary/export-pdf/:year/:month
router.get("/export-pdf/:year/:month", async (req, res) => {
  const { year, month } = req.params;

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const salaries = await TeacherSalary.find({
      salaryMonth: { $gte: startDate, $lt: endDate },
    }).sort({ teacherId: 1 });

    const teacherIds = salaries.map((s) => s.teacherId);
    const teacherDocs = await Teacher.find({ teacherId: { $in: teacherIds } });

    const teacherMap = {};
    teacherDocs.forEach((t) => {
      teacherMap[t.teacherId] = {
        name: t.teacherName,
        fixedSalary: t.fixedSalary || 0,
      };
    });

    const rows = salaries
      .map((s, index) => {
        const presentDays = s.workingDays - s.fullAbsents - 0.5 * s.halfAbsents;
        const tInfo = teacherMap[s.teacherId] || {
          name: "Unknown",
          fixedSalary: 0,
        };
        return `
        <tr>
          <td>${index + 1}</td>
          <td>${s.teacherId}</td>
          <td>${tInfo.name || "Unknown"}</td>
          <td>₹&nbsp;${tInfo.fixedSalary.toFixed(2)}</td>
          <td>${s.workingDays}</td>
          <td>${s.fullAbsents}</td>
          <td>${s.halfAbsents}</td>
          <td>${presentDays}</td>
          <td>₹&nbsp;${s.salaryPaid.toFixed(2)}</td>
        </tr>
      `;
      })
      .join("");

    const html = `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        h1 { text-align: center; color: #4F46E5; margin-bottom: 20px; }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: auto;
        }
        thead { 
          display: table-header-group; 
          background-color: #f3f4f6;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 6px;
          text-align: center;
          vertical-align: middle;
        }
        th {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h1>Teacher Salary Report - ${month}/${year}</h1>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Teacher ID</th>
            <th>Teacher Name</th>
            <th>Fixed Salary</th>
            <th>Working Days</th>
            <th>Full Leaves</th>
            <th>Half Leaves</th>
            <th>Present Days</th>
            <th>Salary Paid</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
  </html>
`;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Salary_Report_${month}_${year}.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

module.exports = router;
