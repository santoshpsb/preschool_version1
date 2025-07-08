const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//const Class = require("../models/Class");

//Route for logging in
router.post("/", async (req, res) => {
  const { username, password } = req.body;
  //await Class.updateMany({}, { $set: { no_of_students: 0 } })

  try {
    let admin = await Admin.findOne({ username });

    if (!admin) {
      //  admin = new Admin({
      //username,
      //password,
      // Pass plain password here
      //});

      //await admin.save();
      //return res.status(201).json({ message: "Admin created and logged in", user: username });

      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { workingUsername: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax", // CSRF protection, adjust if needed
        maxAge: 60 * 60 * 1000, // 1 hour in milliseconds, or use JWT_EXPIRES_IN accordingly
      })
      .status(200)
      .json({
        message: "Login successful",
        user: admin.username,
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



//Route for logging out
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
});


//Route to manage session
router.get("/check-auth", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ username: decoded.username });
  } catch (err) {
    return res.status(403).json({ message: "Token expired or invalid" });
  }
});

module.exports = router;
