import { useState } from 'react';
import SearchBar from './SearchBar';
import "../css/CollectFee.css";

const CollectFee = () => {
  const [searchId, setSearchId] = useState('');
  const [searchedId, setSearchedId] = useState('');

  const handleSearch = () => {
    setSearchedId(searchId.trim());
    // Add your search logic here
  };

  const handleFeeChange = (e) => {
    // This function is defined but feeDetails state is not.
    // You might need to define `feeDetails` state if you intend to use this.
    // For example:
    // const [feeDetails, setFeeDetails] = useState({});
    // Then you can use it as intended.
    //
    // For now, it will cause an error because `feeDetails` is undefined.
    // I'm commenting out the body to prevent immediate errors,
    // but you'll need to uncomment and define `feeDetails`
    // if you plan to use this function.

    /*
    setFeeDetails({
      ...feeDetails,
      [e.target.name]: e.target.value
    });
    */
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit feeDetails here (e.g., send to API)
    // This will also cause an error if `feeDetails` is not defined.
    // I'm commenting out the alert for now.

    /*
    alert(`Fee details submitted:\n${JSON.stringify(feeDetails, null, 2)}`);
    */
  };

  return (
    <div className="view-flex-row">
      <div className="search-bar-block">
        <SearchBar
          placeholder="Student ID"
          value={searchId}
          onChange={setSearchId}
          onSearch={handleSearch}
        />
        {searchedId && (
          <div className="searched-id">
            Searched Teacher ID: <strong>{searchedId}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectFee;