import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

const classMap = {
  PlayGroup: "PG",
  Nursery: "NU",
  "Pre Kindergarten": "PK",
  Kindergarten: "KG",
  DayCare: "DC",
};

const AddTeacher = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingTeacher = location.state?.teacher;
  const from = location.state?.from || "/teacher/teacherprofile";

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  // Pre-fill data if editing
  useEffect(() => {
    if (editingTeacher) {
      reset({
        teacherName: editingTeacher.teacherName || "",
        gender: editingTeacher.gender || "",
        email: editingTeacher.email || "",
        education: editingTeacher.education || "",
        phone: editingTeacher.phone || "",
        emergency: editingTeacher.emergency || "",
        fixedSalary: editingTeacher.fixedSalary ?? "",
      });
    }
  }, [editingTeacher, reset]);

  const [classInputs, setClassInputs] = useState(
    editingTeacher?.classes?.map((cls) => {
      if (typeof cls === "string") {
        const prefix = cls.slice(0, 2);
        const section = cls.slice(2);
        const className = Object.keys(classMap).find(
          (key) => classMap[key] === prefix
        );
        console.log(
          "ClassID:",
          cls,
          "→ Prefix:",
          prefix,
          "→ ClassName:",
          className
        );
        return {
          className,
          section,
        };
      } else if (typeof cls === "object" && cls.class_name && cls.section) {
        return {
          className: cls.class_name,
          section: cls.section,
        };
      }
      return { className: "", section: "" };
    }) || []
  );

  const handleClassChange = (index, field, value) => {
    const updated = [...classInputs];
    updated[index][field] = value;
    setClassInputs(updated);
  };

  const handleAddClass = () => {
    setClassInputs([...classInputs, { className: "", section: "" }]);
  };

  const handleRemoveClass = (index) => {
    const updated = [...classInputs];
    updated.splice(index, 1);
    setClassInputs(updated);
  };

  const onSubmit = async (data) => {
    try {
      // Convert className + section → class_id like "PGA", "KGB"

      const classIds = classInputs
        .filter((ci) => ci.className && ci.section)
        .map((ci) => {
          const prefix = classMap[ci.className];
          const classId = prefix + ci.section.toUpperCase();
          console.log(`Mapped ${ci.className} + ${ci.section} => ${classId}`);
          return classId;
        });
      const payload = {
        ...data,
        classes: classIds,
      };

      let response, result;

      if (editingTeacher) {
        response = await fetch(
          `http://localhost:5000/api/teachers/${editingTeacher._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          }
        );
      } else {
        response = await fetch("http://localhost:5000/api/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
      }

      result = await response.json();

      if (response.ok) {
        toast.success(
          editingTeacher
            ? "Teacher updated successfully!"
            : `Teacher added! ID: ${result.teacher.teacherId}`
        );
        if (editingTeacher) {
          setTimeout(() => navigate(from), 3000);
        } else {
          reset();
          setClassInputs([]); // clear class fields
        }
      } else {
        toast.error("Error: " + result.error);
      }
    } catch (error) {
      toast.error("Network error: " + error.message);
    }
  };

  return (
    <div className="form-center-container">
      <ToastContainer />
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>{editingTeacher ? "Update Teacher" : "Register New Teacher"}</h2>
        <h3>Faculty's Personal Details</h3>

        <label className="mandatory">
          Faculty's Name:
          <input
            {...register("teacherName", { required: "Name is required" })}
            placeholder="(First) / (Middle) / (Last)"
          />
          {errors.teacherName && <span>{errors.teacherName.message}</span>}
        </label>

        <label className="mandatory">
          Gender:
          <select {...register("gender", { required: "Gender is required" })}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <span>{errors.gender.message}</span>}
        </label>

        <label className="mandatory">
          Email:
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <span>{errors.email.message}</span>}
        </label>

        <label className="mandatory">
          Educational Qualification:
          <input
            {...register("education", { required: "Education is required" })}
          />
          {errors.education && <span>{errors.education.message}</span>}
        </label>

        <label className="mandatory">
          Phone:
          <input
            type="tel"
            inputMode="numeric"
            {...register("phone", { required: "Phone is required" })}
          />
          {errors.phone && <span>{errors.phone.message}</span>}
        </label>

        <label className="mandatory">
          Emergency Contact:
          <input
            type="tel"
            inputMode="numeric"
            {...register("emergency", {
              required: "Emergency contact is required",
            })}
          />
          {errors.emergency && <span>{errors.emergency.message}</span>}
        </label>
        <label>
          Fixed Salary:
          <input
            type="number"
            inputMode="numeric"
            {...register("fixedSalary")}
            placeholder="Enter salary (optional)"
          />
        </label>

        {classInputs.map((input, index) => (
          <div
            key={index}
            style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
          >
            <select
              value={input.className}
              onChange={(e) =>
                handleClassChange(index, "className", e.target.value)
              }
            >
              <option value="">Select Class</option>
              <option value="PlayGroup">Play Group</option>
              <option value="Nursery">Nursery</option>
              <option value="Pre Kindergarten">Pre Kindergarten</option>
              <option value="Kindergarten">Kindergarten</option>
              <option value="DayCare">Daycare</option>
            </select>

            <select
              value={input.section}
              onChange={(e) =>
                handleClassChange(index, "section", e.target.value)
              }
            >
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>

            <button type="button" onClick={() => handleRemoveClass(index)}>
              ❌
            </button>
          </div>
        ))}

        <button type="button" onClick={handleAddClass}>
          + Add Class
        </button>

        <input
          id="submit"
          type="submit"
          value={editingTeacher ? "Update Teacher" : "Add Teacher"}
        />
      </form>
    </div>
  );
};

export default AddTeacher;
