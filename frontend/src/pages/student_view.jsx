import { useState, useEffect } from "react";
import "./student_view.css";
import SearchBar from "../components/searchbar";
import "../components/searchbar.css";
import { useNavigate } from "react-router-dom";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const ViewStudent = () => {
  const [searchId, setSearchId] = useState("");
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const handleEdit = (student) => {
    navigate("/student-add", {
      state: {
        student: student, // full student object
        from: "/student-view", // where to go after editing
      },
    });
  };

const fetchStudents = async (pageNum = 1, studentId = "") => {
  try {
    const url = studentId
      ? `http://localhost:5000/api/students/search?id=${studentId}`
      : `http://localhost:5000/api/students/all?page=${pageNum}`;

    const res = await fetch(url, {
          credentials: "include",
        });

    if (!res.ok) {
      if (res.status === 404 && studentId) {
        toast.warn("Invalid Student ID. Showing all students.");
        setSearchId(""); // clear input
        fetchStudents(1); // re-fetch all
        return;
      }
      throw new Error("Fetch failed");
    }

    const data = await res.json();
    setStudents(Array.isArray(data) ? data : [data]);
    setHasMore(!studentId && data.length === 10);
  } catch (error) {
    console.error("Error fetching students:", error);
    toast.error("Failed to fetch student data");
    setStudents([]);
    setHasMore(false);
  }
};



  const handleDelete = async (studentId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/students/deactivate/${studentId}`,
        {
          method: "PUT",
      
          credentials: "include",
        
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Student deactivated!");
        fetchStudents(page); // Refresh list
      } else {
        alert(data.message || "Failed to deactivate");
      }
    } catch (err) {
      console.error("Error deactivating student:", err);
      alert("Something went wrong!");
    }
  };

  useEffect(() => {
    fetchStudents(page);
  }, [page]);

  const handleNext = () => setPage((prev) => prev + 1);
  const handlePrev = () => setPage((prev) => (prev > 1 ? prev - 1 : 1));

  const handleSearch = () => {
    if (!searchId.trim()) return;
    fetchStudents(1, searchId.trim());
  };

  const handleClear = () => {
    setSearchId("");
    fetchStudents(1);
  };
  const [hasMore, setHasMore] = useState(true);

  return (
    <div className="view-flex-column">
      <div className="controls-row">
        <div className="search-bar-block">
          <SearchBar
            placeholder="Student ID"
            value={searchId}
            onChange={setSearchId}
            onSearch={handleSearch}
            onClear={handleClear}
            showClear={!!searchId}
          />
        </div>
      </div>

      <h2>Student List (Page {page})</h2>
      <table className="student-details-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Class</th>
            <th>Section</th>
            <th>Teacher ID</th>
            <th>Teacher Name</th>
            <th>Contact Name</th>
            <th>Contact Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 && (
  <tr>
    <td colSpan="9" style={{ textAlign: "center", color: "#888" }}>
      No students found.
    </td>
  </tr>
)}

          {students.map((student) => {
            const {
              _id,
              studentId,
              studentName,
              className,
              section,
              contactName,
              contactPhone,
              teachers,
            } = student;

          return Array.isArray(teachers) && teachers.length > 0 ? (

              teachers.map((teacher, index) => (
                <tr key={`${_id}-${index}`}>
                  {index === 0 && (
                    <>
                      <td rowSpan={teachers.length}>{studentId}</td>
                      <td rowSpan={teachers.length}>{studentName}</td>
                      <td rowSpan={teachers.length}>{className}</td>
                      <td rowSpan={teachers.length}>{section}</td>
                    </>
                  )}
                  <td>{teacher.teacherId}</td>
                  <td>{teacher.teacherName}</td>
                  {index === 0 && (
                    <>
                      <td rowSpan={teachers.length}>{contactName}</td>
                      <td rowSpan={teachers.length}>{contactPhone}</td>
                      <td rowSpan={teachers.length}>
                        <button
                          className="action-btn"
                          title="Edit"
                          onClick={() => handleEdit(student)}
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn"
                          title="Delete"
                          onClick={() => {
                            const confirmDelete = window.confirm(
                              "Are you sure you want to deactivate this student?"
                            );
                            if (confirmDelete) {
                              handleDelete(_id);
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr key={_id}>
                <td>{studentId}</td>
                <td>{studentName}</td>
                <td>{className}</td>
                <td>{section}</td>
                <td colSpan={2} style={{ textAlign: "center", color: "#999" }}>
                  No teachers assigned
                </td>
                <td>{contactName}</td>
                <td>{contactPhone}</td>
                <td>
                  <button
                    className="action-btn"
                    title="Edit"
                    onClick={() => handleEdit(student)}
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn"
                    title="Delete"
                    onClick={() => {
                      const confirmDelete = window.confirm(
                        "Are you sure you want to deactivate this student?"
                      );
                      if (confirmDelete) {
                        handleDelete(_id);
                      }
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination-controls">
        <button onClick={handlePrev} disabled={page === 1}>
          Previous
        </button>
        <button onClick={handleNext} disabled={!hasMore}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ViewStudent;
