import React from 'react';
import { useAuth } from '../context/AuthContext';

const PageLoader = () => {
    const { isPageLoading } = useAuth();

    if (!isPageLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-color/80 backdrop-blur-sm transition-opacity duration-300">
            <div className="flex flex-col items-center">
                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-border-color border-t-accent-color rounded-full animate-spin mb-4"></div>
                <p className="text-text-color font-semibold animate-pulse">Loading...</p>
            </div>
        </div>
    );
};

export default PageLoader;