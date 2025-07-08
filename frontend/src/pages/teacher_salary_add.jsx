import React, { useState, useEffect } from "react";
import "./teacher_salary_add.css";

const TeacherSalaryForm = () => {
  const [form, setForm] = useState({
    date: "",
    teacherId: "",
    teacherName: "",
    workingDays: "",
    fullAbsents: "",
    halfAbsents: "",
  });

  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isBlocked, setIsBlocked] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      setError("");
      setForm((prev) => ({ ...prev, teacherName: "" }));
      setIsBlocked(true);

      if (form.date && form.teacherId) {
        const monthStr = form.date;

        try {
          const res = await fetch(
            `http://localhost:5000/api/teacherSalary/check/${form.teacherId}?month=${monthStr}`,
            { credentials: "include" }
          );

          if (res.status === 404) {
            setError("Teacher not found or inactive.");
            return;
          } else if (res.status === 409) {
            const data = await res.json();
            setForm((prev) => ({
              ...prev,
              teacherName: data.teacherName || "",
            }));
            setError("Salary already submitted for this teacher and month.");
            return;
          } else if (!res.ok) {
            setError("Something went wrong while checking teacher.");
            return;
          }

          const data = await res.json();
          setForm((prev) => ({ ...prev, teacherName: data.teacherName }));
          setIsBlocked(false); // enable inputs
        } catch (err) {
          setError("Network error while checking teacher.");
        }
      }
    };

    fetchTeacher();
  }, [form.date, form.teacherId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    if (isBlocked) {
      setError("Cannot submit. Resolve above issue first.");
      return;
    }

    try {
      const payload = {
        teacherId: form.teacherId,
        salaryMonth: form.date,
        workingDays: Number(form.workingDays),
        fullAbsents: Number(form.fullAbsents),
        halfAbsents: Number(form.halfAbsents),
      };

      const res = await fetch("http://localhost:5000/api/teacherSalary/", {
        method: "POST",
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(`❌ ${errData.error || "Failed to submit salary record."}`);
        return;
      }

      setStatus("✅ Salary record submitted successfully.");
      setForm({
        date: "",
        teacherId: "",
        teacherName: "",
        workingDays: "",
        fullAbsents: "",
        halfAbsents: "",
      });
      setIsBlocked(true);
    } catch (err) {
      setError("❌ Network error while submitting record.");
    }
  };

  return (
    <div className="salary-form-container">
      <h2 className="form-title">Teacher Salary Entry</h2>

      <form onSubmit={handleSubmit} className="salary-form">
        <div className="form-row">
          <div className="form-group">
            <label>Date (Month)</label>
            <input
              type="month"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Teacher ID</label>
            <input
              type="text"
              name="teacherId"
              value={form.teacherId}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Teacher Name</label>
          <input
            type="text"
            name="teacherName"
            value={form.teacherName}
            disabled
            placeholder="Fetched automatically"
          />
        </div>

        <div className="form-group">
          <label>Working Days</label>
          <input
            type="number"
            name="workingDays"
            value={form.workingDays}
            onChange={handleChange}
            required
            disabled={isBlocked}
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Full Absents</label>
          <input
            type="number"
            name="fullAbsents"
            value={form.fullAbsents}
            onChange={handleChange}
            required
            disabled={isBlocked}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Half Absents</label>
          <input
            type="number"
            name="halfAbsents"
            value={form.halfAbsents}
            onChange={handleChange}
            required
            disabled={isBlocked}
            min="0"
          />
        </div>

        {error && <div className="form-error">{error}</div>}
        {status && <div className="form-success">{status}</div>}

        <button type="submit" className="submit-btn" disabled={isBlocked}>
          Submit Salary
        </button>
      </form>
    </div>
  );
};

export default TeacherSalaryForm;
