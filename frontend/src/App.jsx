import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import AdminLogin from "./pages/login_page";
import Navbar from "./components/Navbar";
import AddStudent from "./pages/student_add";
import ViewStudent from "./pages/student_view";
import AddTeacher from "./pages/teacher_add";
import ViewTeacher from "./pages/teacher_view";
import TeacherSalaryForm from "./pages/teacher_salary_add";
import TeacherSalaryView from "./pages/teacher_salary_view";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Wait for auth check

  useEffect(() => {
    fetch("http://localhost:5000/api/login/check-auth", {
      method: "GET",
      credentials: "include", // sends cookies
    })
      .then((res) => {
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch((err) => {
        console.error("Auth check failed", err);
        setIsLoggedIn(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading...</div>; // or a fancy loader
  }

  return (
    <Router>
      <ToastContainer
        position="top-center"
        autoClose={true}
        closeOnClick={false}
        draggable={false}
        pauseOnHover={true}
      />
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/teacher-salary-view" />
            ) : (
              <AdminLogin setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            isLoggedIn ? (
              <MainLayout setIsLoggedIn={setIsLoggedIn}>
                <AppRoutes />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

function MainLayout({ children, setIsLoggedIn }) {
  return (
    <>
      <Navbar setIsLoggedIn={setIsLoggedIn} />
      <ToastContainer
        position="top-center"
        autoClose={false}
        closeOnClick={false}
        draggable={false}
        pauseOnHover={true}
      />
      <div className="page-container">{children}</div>
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="student-add" element={<AddStudent />} />
      <Route path="student-view" element={<ViewStudent />} />
      <Route path="teacher-add" element={<AddTeacher />} />
      <Route path="teacher-view" element={<ViewTeacher />} />
      <Route path="teacher-salary-add" element={<TeacherSalaryForm />} />
      <Route path="teacher-salary-view" element={<TeacherSalaryView />} />
    </Routes>
  );
}

export default App;
