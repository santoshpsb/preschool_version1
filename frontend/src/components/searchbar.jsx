import React from "react";

import "./searchbar.css";

const SearchBar = ({
  placeholder,
  value,
  onChange,
  onSearch,
  onClear,
  showClear,
}) => (
  <form
    className="search-form"
    onSubmit={(e) => {
      e.preventDefault();

      onSearch();
    }}
    autoComplete="off"
  >
    <div className="search-input-wrapper">
      <input
        className="search-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {showClear && (
        <button
          type="button"
          className="clear-icon"
          onClick={onClear}
          aria-label="Clear"
        >
          ✖
        </button>
      )}

      <button
        type="submit"
        className="search-icon"
        tabIndex={-1}
        aria-label="Search"
      >
        🔍
      </button>
    </div>
  </form>
);

export default SearchBar;
