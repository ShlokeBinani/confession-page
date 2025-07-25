import React from 'react';
import StarBorder from '../StarBorder';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search..."
}) => (
  <StarBorder
    as="div"
    // Add thick, dark blue border here
    className="w-full border-2 border-blue-900 rounded-xl"
    color="#1e3a8a"      // Dark blue for animation
    speed="7s"
    thickness={0}        // Thin animated effect
  >
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-primary-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="input-field pl-10 pr-4 bg-transparent text-primary-700"
        aria-label="Search"
      />
    </div>
  </StarBorder>
);

export default SearchBar;
