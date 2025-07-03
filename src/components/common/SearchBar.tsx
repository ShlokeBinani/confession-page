import React from 'react';
import StarBorder from '../StarBorder'; // Adjust the path as needed

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search by City, Age, or Metadata..." 
}) => {
  return (
    <StarBorder
      as="div"
      className="w-full"
      color="#2563eb" // Use your theme blue
      speed="7s"
      thickness={2}
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
};

export default SearchBar;
