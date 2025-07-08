import React, { useState, useEffect } from "react";
import "./teacher_salary_view.css";

const TeacherSalaryView = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReport = async (pageNum = 1) => {
    setError("");
    setLoading(true);
    setReportData([]);

    try {
      const res = await fetch(
        `http://localhost:5000/api/teacherSalary/view/${selectedYear}/${selectedMonth}?page=${pageNum}&limit=25`,
        { credentials: "include" }
      );
      const json = await res.json();

      if (!res.ok)
        throw new Error(json.error || "Failed to fetch salary data.");

      setReportData(json.data || []);
      setPage(json.page || 1);
      setTotalPages(json.totalPages || 1);
    } catch (err) {
      setError(err.message || "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Reset page on date change
  useEffect(() => {
    setPage(1);
  }, [selectedMonth, selectedYear]);

  const handleGenerateReport = () => {
    fetchReport(1); // Reset to first page on new request
  };

  const handlePageChange = (newPage) => {
    fetchReport(newPage);
  };

  return (
    <div className="salary-view-container">
      <h1 className="title">Teacher Salary View</h1>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="month">Month:</label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            disabled={loading}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString("en-US", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="year">Year:</label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            disabled={loading}
          >
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - 2 + i
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          className="generate-btn"
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? "Loading..." : "View Salary Report"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {reportData.length > 0 ? (
        <div className="table-wrapper">
          <h2 className="report-title">
            Report for{" "}
            {new Date(0, selectedMonth - 1).toLocaleString("en-US", {
              month: "long",
            })}{" "}
            {selectedYear}
          </h2>
          <table className="salary-table">
            <thead>
              <tr>
                <th>Teacher ID</th>
                <th>Teacher Name</th>
                <th>Working Days</th>
                <th>Full Day Leaves</th>
                <th>Half Day Leaves</th>
                <th>Present Days</th>
                <th>Monthly Salary (₹)</th>
                <th>Salary To Be Paid (₹)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => (
                <tr key={row.teacherId}>
                  <td>{row.teacherId}</td>
                  <td>{row.teacherName}</td>
                  <td>{row.workingDays}</td>
                  <td>{row.fullAbsents}</td>
                  <td>{row.halfAbsents}</td>
                  <td>{row.presentDays}</td>
                  <td>₹ {row.monthlySalary.toFixed(2)}</td>
                  <td>₹ {row.salaryToBePaid.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="page-btn"
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="page-btn"
            >
              Next
            </button>
          </div>
          <button
            onClick={async () => {
              const year = selectedYear;
              const month = selectedMonth;

              try {
                // Send the request to the server to fetch the PDF
                const response = await fetch(
                  `http://localhost:5000/api/teacherSalary/export-pdf/${year}/${month}`,
                  {
                    method: "GET",
                    credentials: "include",

                    headers: {
                      "Content-Type": "application/pdf",
                    },
                  }
                );

                if (!response.ok) {
                  throw new Error("Failed to download PDF");
                }
                // Get the response as a blob (PDF data)
                const blob = await response.blob();
                // Create a temporary URL for the Blob
                const url = window.URL.createObjectURL(blob);
                // Create an invisible anchor element
                const a = document.createElement("a");
                // Set the download attribute with a filename
                a.href = url;
                a.download = `Teacher_Salary_Report_${month}_${year}.pdf`;
                // Append the anchor to the body (required to trigger the download)
                document.body.appendChild(a);
                // Trigger a click event to start the download
                a.click();
                // Remove the anchor after the download starts
                document.body.removeChild(a);
                // Revoke the object URL to release memory
                window.URL.revokeObjectURL(url);
              } catch (error) {
                console.error("Download error:", error);
                alert("Error downloading PDF.");
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Download PDF Report
          </button>
        </div>
      ) : (
        !loading &&
        !error && (
          <div className="no-records">
            No salary records found for the selected month and year.
          </div>
        )
      )}
    </div>
  );
};

export default TeacherSalaryView;
