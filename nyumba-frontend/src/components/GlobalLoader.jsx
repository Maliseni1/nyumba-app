import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const GlobalLoader = () => {
    const { isPageLoading } = useAuth();

    useEffect(() => {
        if (isPageLoading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isPageLoading]);

    if (!isPageLoading) {
        return null;
    }

    return (
        // USE THE NEW CSS CLASS (no z-index, blur, or bg here)
        <div className="global-loader">
            <div className="flex flex-col items-center">
                <FaSpinner className="animate-spin text-accent-color h-12 w-12" />
                <p className="text-white text-lg mt-4 font-semibold">Loading...</p>
            </div>
        </div>
    );
};

export default GlobalLoader;