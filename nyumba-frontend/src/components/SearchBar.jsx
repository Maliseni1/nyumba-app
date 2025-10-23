import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch, initialQuery = '', placeholder }) => {
    const [query, setQuery] = useState(initialQuery);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-4 pr-12 text-lg text-white bg-slate-800/50 border-2 border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 backdrop-blur-sm"
                />
                <button type="submit" className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-white" aria-label="Search">
                    <FaSearch size={20} />
                </button>
            </div>
        </form>
    );
};
export default SearchBar;