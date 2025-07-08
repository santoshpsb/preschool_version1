import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchBar from "../components/searchbar";
import "./teacher_view.css";

const ViewTeacher = () => {
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTeachers = async (page = 1) => {
    try {
      const res = await fetch(`http://localhost:5000/api/teachers?page=${page}`,{          credentials: "include",
});
      const data = await res.json();
      setTeachers(data.teachers);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const fetchTeacherById = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/teachers/search/${id}`,{          credentials: "include",
});
      if (!res.ok) {
        setTeachers([]);
        setTotalPages(1);
        setCurrentPage(1);
        alert("Teacher not found");
        return;
      }
      const data = await res.json();
      setTeachers([data.teacher]);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (err) {
      console.error("Search failed", err);
      alert("Error while searching");
    }
  };

  useEffect(() => {
    if (!searchId.trim()) {
      fetchTeachers(1);
    }
  }, [searchId]);

  const handlePrev = () => {
    if (currentPage > 1) fetchTeachers(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) fetchTeachers(currentPage + 1);
  };

  const handleClear = () => {
    setSearchId("");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this teacher?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/teachers/${id}`, {
        method: "DELETE",
                  credentials: "include",

      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete teacher");
      }

      alert("Teacher deleted successfully");

      if (searchId.trim()) {
        setTeachers([]);
        setSearchId(""); // reset to show full list
      } else {
        fetchTeachers(currentPage);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="view-flex-column">
      <div className="controls-row">
        <div className="search-bar-block">
          <SearchBar
            placeholder="Search Teacher ID"
            value={searchId}
            onChange={setSearchId}
            onClear={handleClear}
            showClear={searchId.trim() !== ""}
            onSearch={() => fetchTeacherById(searchId.trim())}
          />
        </div>
      </div>

      {searchId.trim() && (
        <p style={{ fontStyle: "italic" }}>
          Showing result for: <strong>{searchId.trim()}</strong>
        </p>
      )}

      {teachers.length > 0 && (
        <div className="student-details-table-block">
          <table className="student-details-table">
            <thead>
              <tr>
                <th>Teacher ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Class</th>
                <th>Section</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) =>
                teacher.classes.length > 0 ? (
                  teacher.classes.map((cls, index) => (
                    <tr key={`${teacher._id}-${index}`}>
                      {index === 0 && (
                        <>
                          <td rowSpan={teacher.classes.length}>{teacher.teacherId}</td>
                          <td rowSpan={teacher.classes.length}>{teacher.teacherName}</td>
                          <td rowSpan={teacher.classes.length}>{teacher.email}</td>
                          <td rowSpan={teacher.classes.length}>{teacher.phone}</td>
                        </>
                      )}
                      <td>{cls.class_name}</td>
                      <td>{cls.section}</td>
                      {index === 0 && (
                        <td rowSpan={teacher.classes.length}>
                          <button
                            className="action-btn"
                            title="Edit"
                            onClick={() =>
                              navigate("/teacher-add", {
                                state: {
                                  teacher: teacher,
                                  from: "/teacher-view",
                                },
                              })
                            }
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn"
                            title="Delete"
                            onClick={() => handleDelete(teacher._id)}
                          >
                            🗑️
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr key={teacher._id}>
                    <td>{teacher.teacherId}</td>
                    <td>{teacher.teacherName}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.phone}</td>
                    <td colSpan={2} style={{ textAlign: "center", color: "#999" }}>
                      No classes assigned
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        title="Edit"
                        onClick={() =>
                          navigate("/teacher-add", {
                            state: {
                              teacher: teacher,
                              from: "/teacher-view",
                            },
                          })
                        }
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn"
                        title="Delete"
                        onClick={() => handleDelete(teacher._id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {searchId.trim() === "" && (
            <div className="pagination-controls">
              <button onClick={handlePrev} disabled={currentPage === 1}>
                &laquo; Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={handleNext} disabled={currentPage === totalPages}>
                Next &raquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewTeacher;
