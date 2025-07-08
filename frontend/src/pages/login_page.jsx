import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css"; 
import "./login_page.css";

const AdminLogin = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const [isError, setIsError] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok) {
          console.log("Login successful:", data);
          setIsLoggedIn(true);
          navigate("/student-add");
        } else {
          setIsError(true);
          setIsDisabled(true);
          
          toast.error(data.message || "Wrong credentials. Please try again.",{autoClose:2000});


          setTimeout(() => {
            setIsError(false);
            setIsDisabled(false);
          }, 3000);
          console.error("Login failed:", data.message);
        }
      } else {
        console.error("Unexpected response format:", await response.text());
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (  
    <div className="login-container">
      <div className="login-video-section">
        <div className="login-top-text">This is caption No -1</div>
        <video ref={videoRef}  autoPlay muted loop playsInline>
          <source src="play.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="login-bottom-text">This is caption No-2</div>
      </div>

      <div className="login-form-section">
        <div className="login-form-block">
          <h2>Admin Login</h2>
          <form onSubmit={handleSubmit} id="admin_login">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />

            <button
              type="submit"
              disabled={isDisabled}
              className={`login-button ${isError ? "login-error" : ""} ${
                isError ? "login-shake" : ""
              }`}
            >
              {isError ? "Wrong credentials" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
