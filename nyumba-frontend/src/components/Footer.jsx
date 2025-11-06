import React from 'react';

const Footer = () => {
    return (
        // 1. Added bg-bg-color and text-subtle-text-color
        <footer className="w-full py-4 text-center bg-bg-color">
            <p className="text-xs text-subtle-text-color">
                &copy; {new Date().getFullYear()} Chiza Labs. All Rights Reserved.
            </p>
        </footer>
    );
};

export default Footer;