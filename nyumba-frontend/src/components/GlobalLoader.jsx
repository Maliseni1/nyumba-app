import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const GlobalLoader = () => {
    const { isPageLoading } = useAuth();

    if (!isPageLoading) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="flex flex-col items-center">
                <FaSpinner className="animate-spin text-accent-color h-12 w-12" />
                <p className="text-white text-lg mt-4 font-semibold">Loading...</p>
            </div>
        </div>
    );
};

export default GlobalLoader;