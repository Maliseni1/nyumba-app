import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaEnvelope, FaPlusSquare, FaCog, FaCreditCard, FaGem } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    // Get all user-related data from our global context
    const { authUser, unreadCount } = useAuth();
    
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
            setPrevScrollPos(currentScrollPos);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollPos]);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-lg border-b border-slate-700/50 transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <Link to="/"><img src="/logo.png" alt="Nyumba Logo" className="h-12 w-auto logo-glow" /></Link>
                    </div>
                    <div className="flex items-center space-x-6">
                        {/* Use authUser from context to determine if a user is logged in */}
                        {authUser ? (
                            <>
                                <span className="text-slate-300 hidden sm:block">Welcome, {authUser.name}</span>
                                <Link to="/profile" title="Profile" className="text-slate-300 hover:text-white transition-colors text-2xl"><FaUserCircle /></Link>
                                <Link to="/messages" title="Messages" className="relative text-slate-300 hover:text-white transition-colors text-2xl">
                                    <FaEnvelope />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>
                                <Link to="/add-listing" title="Add Listing" className="text-sky-400 hover:text-sky-300 transition-colors text-2xl"><FaPlusSquare /></Link>
                                <Link to="/payments" title="Payment History" className="text-slate-300 hover:text-white transition-colors text-2xl"><FaCreditCard /></Link>
                                <Link to="/settings" title="Settings" className="text-slate-300 hover:text-white transition-colors text-2xl"><FaCog /></Link>
                            </>
                        ) : (
                            <>
                                <Link to="/subscription" title="Subscription" className="text-amber-400 hover:text-amber-300 transition-colors text-2xl"><FaGem /></Link>
                                <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Login</Link>
                                <Link to="/register" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;