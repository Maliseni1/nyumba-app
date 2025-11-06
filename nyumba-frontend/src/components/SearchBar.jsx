import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch, initialQuery = '', placeholder }) => {
    const [query, setQuery] = useState(initialQuery);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto w-full">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    // --- 1. UPDATED THEME CLASSES ---
                    className="w-full p-4 pr-12 text-lg text-text-color bg-card-color border-2 border-border-color rounded-full focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-accent-color backdrop-blur-sm"
                />
                <button 
                    type="submit" 
                    // --- 2. UPDATED BUTTON THEME CLASSES ---
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-subtle-text-color hover:text-text-color" 
                    aria-label="Search"
                >
                    <FaSearch size={20} />
                </button>
            </div>
        </form>
    );
};
export default SearchBar;