import { useState } from 'react';
import SearchBar from './SearchBar';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/EnrollFee.css";

const EnrollFee = () => {
  const [searchId, setSearchId] = useState('');
  const [searchedId, setSearchedId] = useState('');
  const [feeDetails, setFeeDetails] = useState({
    tuitionFee: '',
    admissionFee: '',
    processingFee: '',
    discount: ''
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);

  const handleSearch = () => {
    setSearchedId(searchId.trim());
    // Optionally, fetch student details here to validate studentId
  };

  const handleFeeChange = (e) => {
    setFeeDetails({
      ...feeDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e, forceUpdate = false) => {
    e.preventDefault();
    const payload = {
      studentId: searchedId,
      tuitionFee: Number(feeDetails.tuitionFee),
      admissionFee: Number(feeDetails.admissionFee),
      processingFee: Number(feeDetails.processingFee),
      discount: Number(feeDetails.discount),
      ...(forceUpdate ? { forceUpdate: true } : {})
    };

    try {
      const res = await fetch("http://localhost:3000/api/enrollfee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Fee details enrolled successfully!");
        setFeeDetails({
          tuitionFee: '',
          admissionFee: '',
          processingFee: '',
          discount: ''
        });
      } else if (res.status === 409) {
        // Show custom confirmation popup
        setShowConfirm(true);
        setPendingEvent(e);
      } else {
        toast.error(data.error || "Failed to enroll fee details.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    }
  };

  // Handler for confirming update
  const handleConfirmUpdate = () => {
    setShowConfirm(false);
    if (pendingEvent) {
      handleSubmit(pendingEvent, true);
      setPendingEvent(null);
    }
  };

  // Handler for cancelling update
  const handleCancelUpdate = () => {
    setShowConfirm(false);
    setPendingEvent(null);
  };

  return (
    <div className="view-flex-row">
      <ToastContainer />
      <div className="search-bar-block">
        <SearchBar
          placeholder="Student ID"
          value={searchId}
          onChange={setSearchId}
          onSearch={handleSearch}
        />
      </div>
      {searchedId && (
        <div className="fee-form-block">
          <form className="fee-inputs" onSubmit={handleSubmit}>
            <label>
              Tuition Fee:
              <input
                type="text"
                name="tuitionFee"
                value={feeDetails.tuitionFee}
                onChange={handleFeeChange}
                placeholder="Enter tuition fee"
              />
            </label>
            <label>
              Admission Fee:
              <input
                type="text"
                name="admissionFee"
                value={feeDetails.admissionFee}
                onChange={handleFeeChange}
                placeholder="Enter admission fee"
              />
            </label>
            <label>
              Processing Fee:
              <input
                type="text"
                name="processingFee"
                value={feeDetails.processingFee}
                onChange={handleFeeChange}
                placeholder="Enter processing fee"
              />
            </label>
            <label>
              Discount:
              <input
                type="text"
                name="discount"
                value={feeDetails.discount}
                onChange={handleFeeChange}
                placeholder="Enter discount"
              />
            </label>
            <button type="submit" className="fee-submit-btn">Submit</button>
          </form>
        </div>
      )}

      {/* Custom confirmation popup */}
      {showConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-popup">
            <p>Fee details already exist for this student.<br />Do you want to update them?</p>
            <button onClick={handleConfirmUpdate}>Yes</button>
            <button onClick={handleCancelUpdate}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollFee;