import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/we_logo.png";

const Navbar = ({ setIsLoggedIn }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
  const [feeDropdownOpen, setFeeDropdownOpen] = useState(false);

  const navigate = useNavigate();

const handleLogout = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/login/logout", {
      method: "POST",
      credentials: "include", // Important for sending the auth cookie
    });

    if (response.ok) {
      setIsLoggedIn(false);                // Update login state
      navigate("/");                       // Redirect to login page
    } else {
      const data = await response.json();
      console.error("Logout failed:", data.message || "Unknown error");
    }
  } catch (error) {
    console.error("Logout failed:", error.message);
  }
};


  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Logo" height="60" />
      </div>

      <div className="navbar-center">
        <ul className="navbar-links">
          <li>
            <Link to="/student-add">Home</Link>
          </li>

          <li
            className="dropdown"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="dropdown-toggle">Student</button>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link
                    to="/student-view"
                    onClick={() => setDropdownOpen(false)}
                  >
                    View
                  </Link>
                </li>
                <li>
                  <Link
                    to="/student-add"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Add
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li
            className="dropdown"
            onMouseEnter={() => setTeacherDropdownOpen(true)}
            onMouseLeave={() => setTeacherDropdownOpen(false)}
          >
            <button className="dropdown-toggle">Teacher</button>
            {teacherDropdownOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link
                    to="/teacher-view"
                    onClick={() => setTeacherDropdownOpen(false)}
                  >
                    View
                  </Link>
                </li>
                <li>
                  <Link
                    to="/teacher-add"
                    onClick={() => setTeacherDropdownOpen(false)}
                  >
                    Add
                  </Link>
                </li>
                <li>
                  <Link
                    to="/teacher-salary-add"
                    onClick={() => setTeacherDropdownOpen(false)}
                  >
                    Salary add
                  </Link>
                </li><li>
                  <Link
                    to="/teacher-salary-view"
                    onClick={() => setTeacherDropdownOpen(false)}
                  >
                    Salary View
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Optional: Keep or comment Fee menu until implemented */}
          <li
            className="dropdown"
            onMouseEnter={() => setFeeDropdownOpen(true)}
            onMouseLeave={() => setFeeDropdownOpen(false)}
          >
            <button className="dropdown-toggle">Fee</button>
            {feeDropdownOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/fee/viewfee" onClick={() => setFeeDropdownOpen(false)}>View</Link>
                </li>
                <li>
                  <Link to="/fee/enrollfee" onClick={() => setFeeDropdownOpen(false)}>Enroll</Link>
                </li>
                <li>
                  <Link to="/fee/collectfee" onClick={() => setFeeDropdownOpen(false)}>Collect</Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      <div className="navbar-right">
        <button className="navbar-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
