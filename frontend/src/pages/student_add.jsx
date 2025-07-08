import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";

import "./student_add.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddStudent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [classAvailable, setClassAvailable] = useState(true);
  const [classId, setClassId] = useState("");
  const [skipAvailabilityCheck, setSkipAvailabilityCheck] = useState(false);

  const editingStudent = location.state?.student;
  const from = location.state?.from || "/student-view";

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    getValues,
    watch,
  } = useForm({ mode: "onChange" });

  const checkAvailability = async (selectedClass, selectedSection) => {
    if (!selectedClass || !selectedSection) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/class/availability?className=${selectedClass}&section=${selectedSection}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();

      setClassAvailable(data.available);
      if (data.available) {
        setClassId(data.classId);
      } else {
        setClassId("");
        if (!skipAvailabilityCheck) toast.warn(data.message);
      }
    } catch (err) {
      if (!skipAvailabilityCheck)
        toast.error("Failed to check class availability");
    }
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (
        (name === "admissionSeeking" || name === "section") &&
        !editingStudent
      ) {
        checkAvailability(value.admissionSeeking, value.section);
      } else if (
        (name === "admissionSeeking" || name === "section") &&
        editingStudent
      ) {
        setSkipAvailabilityCheck(false); // reset in case it was true before
        // Trigger availability check ONLY if user changes the default (edit mode)
        if (
          value.admissionSeeking !== editingStudent.classRef?.class_name ||
          value.section !== editingStudent.classRef?.section
        ) {
          checkAvailability(value.admissionSeeking, value.section);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, editingStudent]);

  useEffect(() => {
    if (editingStudent) {
      const studentToEdit = { ...editingStudent };
      console.log(studentToEdit);

      if (studentToEdit.dob) {
        studentToEdit.dob = studentToEdit.dob.slice(0, 10);
      }
      reset({
        ...studentToEdit,
        dob: studentToEdit.dob?.slice(0, 10) || "",
        admissionSeeking: studentToEdit.classRef?.class_name || "",
        section: studentToEdit.classRef?.section || "",
      });
      setClassId(editingStudent.classRef?.class_id || "");
    }
  }, [editingStudent, reset]);

  useEffect(() => {
    if (editingStudent) {
      setSkipAvailabilityCheck(true); // suppress toasts temporarily
    }
  }, [editingStudent]);

  const deepTrim = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(deepTrim);

    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        typeof v === "string" ? v.trim() : deepTrim(v),
      ])
    );
  };

  const onSubmit = async (data) => {
    try {
      if (!classAvailable || !classId) {
        toast.error("Class is full or invalid");
        return;
      }
      let response, result;
      console.log(1, data);
      const trimmed = deepTrim(data);
      const fullData = { ...trimmed, class_id: classId };
      console.log(fullData);

      if (editingStudent) {
        response = await fetch(
          `http://localhost:5000/api/students/${editingStudent._id}`,

          {
            method: "PUT",

            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(fullData),
          }
        );

        result = await response.json();

        if (response.ok) {
          toast.success(`Student updated successfully!`);
        } else {
          alert("Error: " + result.error);
        }

        setTimeout(() => {
          navigate(from, { state: { refresh: true } });
        }, 7000);
      } else {
        response = await fetch("http://localhost:5000/api/students", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },

          body: JSON.stringify(fullData),
        });

        result = await response.json();

        if (response.ok) {
          toast.success(
            `Student added successfully! Student ID: ${result.student.studentId}`
          );
        } else {
          alert("Error: " + result.error);
        }
      }
    } catch (error) {
      alert("Network error: " + error.message);
    }
  };

  return (
    <div className="form-center-container">
      <ToastContainer />

      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>
          {editingStudent
            ? "Update Student Information"
            : "Register New Student"}
        </h2>

        <h3>Admission Details</h3>

        <label className="mandatory">
          Admission seeking in:
          <br />
          <select
            {...register("admissionSeeking", { required: true })}
            defaultValue=""
          >
            <option value="" disabled>
              Select an option
            </option>

            <option value="PlayGroup">PlayGroup</option>

            <option value="Nursery">Nursery</option>

            <option value="Pre Kindergarten">Pre Kindergarten</option>

            <option value="Kindergarten">Kindergarten</option>

            <option value="DayCare">DayCare</option>
          </select>
        </label>

        <label className="mandatory">
          Section:
          <br />
          <select {...register("section", { required: true })} defaultValue="">
            <option value="" disabled>
              Select section
            </option>

            <option value="A">A</option>

            <option value="B">B</option>
          </select>
        </label>

        <h3>Candidate's Personal Details</h3>

        <label className="mandatory">
          Student's Name:
          <br />
          <input
            {...register("studentName", { required: true })}
            placeholder="(First) / (Middle) / (Last)"
          />
        </label>

        <label className="mandatory">
          Date of Birth:
          <br />
          <input type="date" {...register("dob", { required: true })} />
        </label>

        <label className="mandatory">
          Gender:
          <br />
          <select {...register("gender", { required: true })}>
            <option value="">Select</option>

            <option value="male">Male</option>

            <option value="female">Female</option>
          </select>
        </label>

        <label className="mandatory">
          Place of Birth:
          <br />
          <input
            {...register("placeOfBirth", { required: true })}
            placeholder="Place of Birth"
          />
        </label>

        <label className="mandatory">
          Nationality:
          <br />
          <input
            {...register("nationality", { required: true })}
            placeholder="Nationality"
          />
        </label>

        <label className="mandatory">
          First Language:
          <br />
          <input
            {...register("firstLanguage", { required: true })}
            placeholder="First Language"
          />
        </label>

        <label>
          Other Languages Known:
          <br />
          <input
            {...register("otherLanguages")}
            placeholder="Other Languages"
          />
        </label>

        <h3>Residential address & family information</h3>

        <label className="mandatory">
          Address:
          <br />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              {...register("address.location", { required: true })}
              placeholder="Location"
              style={{ minWidth: "120px" }}
            />

            <input
              {...register("address.city", { required: true })}
              placeholder="City"
              style={{ minWidth: "100px" }}
            />

            <input
              {...register("address.state", { required: true })}
              placeholder="State"
              style={{ minWidth: "100px" }}
            />

            <input
              {...register("address.country", { required: true })}
              placeholder="Country"
              style={{ minWidth: "100px" }}
            />

            <input
              {...register("address.pincode", { required: true })}
              placeholder="Pincode"
              style={{ minWidth: "80px" }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
        </label>

        <h3>Father</h3>

        <label className="mandatory">
          Full Name:
          <br />
          <input
            {...register("father.fullName", { required: true })}
            placeholder="(First) / (Middle) / (Last)"
          />
        </label>

        <label className="mandatory">
          Email:
          <br />
          <input
            type="email"
            {...register("father.email", { required: true })}
          />
        </label>

        <label className="mandatory">
          Educational Qualification:
          <br />
          <input {...register("father.education", { required: true })} />
        </label>

        <label className="mandatory">
          Profession:
          <br />
          <input {...register("father.profession", { required: true })} />
        </label>

        <label className="mandatory">
          Company Name:
          <br />
          <input {...register("father.companyName", { required: true })} />
        </label>

        <label className="mandatory">
          Designation:
          <br />
          <input {...register("father.designation", { required: true })} />
        </label>

        <label className="mandatory">
          Phone:
          <br />
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            {...register("father.phone", { required: true })}
          />
        </label>

        <h3>Mother</h3>

        <label className="mandatory">
          Full Name:
          <br />
          <input
            {...register("mother.fullName", { required: true })}
            placeholder="(First) / (Middle) / (Last)"
          />
        </label>

        <label className="mandatory">
          Email:
          <br />
          <input
            type="email"
            {...register("mother.email", { required: true })}
          />
        </label>

        <label className="mandatory">
          Educational Qualification:
          <br />
          <input {...register("mother.education", { required: true })} />
        </label>

        <label className="mandatory">
          Profession:
          <br />
          <input {...register("mother.profession", { required: true })} />
        </label>

        <label>
          Company Name:
          <br />
          <input {...register("mother.companyName", { required: true })} />
        </label>

        <label className="mandatory">
          Designation:
          <br />
          <input {...register("mother.designation", { required: true })} />
        </label>

        <label className="mandatory">
          Phone:
          <br />
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            {...register("mother.phone", { required: true })}
          />
        </label>

        <h3>Guardian:(if applicable)</h3>

        <label className="mandatory">
          Full Name:
          <br />
          <input
            {...register("guardian.fullName", { required: true })}
            placeholder="(First) / (Middle) / (Last)"
          />
        </label>

        <label className="mandatory">
          Email:
          <br />
          <input
            type="email"
            {...register("guardian.email", { required: true })}
          />
        </label>

        <label className="mandatory">
          Relation with student:
          <br />
          <input
            {...register("guardian.relationWithStudent", { required: true })}
          />
        </label>

        <label className="mandatory">
          Phone:
          <br />
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            {...register("guardian.phone", { required: true })}
          />
        </label>

        <input
          id="submit"
          type="submit"
          value={editingStudent ? "Update Student" : "Add Student"}
        />
      </form>
    </div>
  );
};

export default AddStudent;
