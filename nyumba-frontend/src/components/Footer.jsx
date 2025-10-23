import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full py-4 text-center">
            <p className="text-xs text-slate-500">
                &copy; {new Date().getFullYear()} Chiza Labs. All Rights Reserved.
            </p>
        </footer>
    );
};

export default Footer;