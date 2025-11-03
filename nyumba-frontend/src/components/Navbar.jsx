import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaUserCircle, 
    FaEnvelope, 
    FaPlusSquare, 
    FaCog, 
    FaCreditCard, 
    FaGem,
    FaTachometerAlt,
    FaMap,
    FaBars,
    FaTimes,
    FaChartBar // <-- 1. IMPORT NEW ICON
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';

const Navbar = () => {
    const { authUser, unreadCount } = useAuth();
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
            setPrevScrollPos(currentScrollPos);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollPos]);

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    // --- DESKTOP LINKS ---
    const desktopLinks = (
        <div className="hidden md:flex items-center space-x-6">
            {authUser ? (
                <>
                    <span className="text-slate-300 hidden sm:block">Welcome, {authUser.name}</span>
                    
                    <Link to="/map" title="Map View" className="text-slate-300 hover:text-white transition-colors text-2xl">
                        <FaMap />
                    </Link>

                    {authUser.isAdmin && (
                        <Link to="/admin/dashboard" title="Admin Dashboard" className="text-yellow-400 hover:text-yellow-300 transition-colors text-2xl">
                            <FaTachometerAlt />
                        </Link>
                    )}

                    <Link to="/profile" title="Profile" className="text-slate-300 hover:text-white transition-colors text-2xl"><FaUserCircle /></Link>
                    
                    <Link to="/messages" title="Messages" className="relative text-slate-300 hover:text-white transition-colors text-2xl">
                        <FaEnvelope />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </Link>
                    
                    {/* Link for ALL Landlords */}
                    {authUser.role === 'landlord' && (
                        <Link to="/add-listing" title="Add Listing" className="text-sky-400 hover:text-sky-300 transition-colors text-2xl">
                            <FaPlusSquare />
                        </Link>
                    )}

                    {/* --- 2. NEW LINK FOR VERIFIED LANDLORDS --- */}
                    {authUser.role === 'landlord' && authUser.isVerified && (
                        <Link to="/landlord/dashboard" title="Landlord Dashboard" className="text-emerald-400 hover:text-emerald-300 transition-colors text-2xl">
                            <FaChartBar />
                        </Link>
                    )}
                    
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
    );

    // --- MOBILE LINKS (the vertical dropdown) ---
    const mobileLinks = (
        <div className="px-2 pt-2 pb-3 space-y-1">
            {authUser ? (
                <>
                    <Link to="/map" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white rounded-md"><FaMap /> Map View</Link>
                    {authUser.isAdmin && (
                        <Link to="/admin/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-yellow-400 hover:bg-slate-700 rounded-md"><FaTachometerAlt /> Admin Dashboard</Link>
                    )}
                    <Link to="/profile" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white rounded-md"><FaUserCircle /> Profile</Link>
                    <Link to="/messages" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white rounded-md"><FaEnvelope /> Messages {unreadCount > 0 && `(${unreadCount})`}</Link>
                    
                    {/* Link for ALL Landlords */}
                    {authUser.role === 'landlord' && (
                        <Link to="/add-listing" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-sky-400 hover:bg-slate-700 rounded-md"><FaPlusSquare /> Add Listing</Link>
                    )}

                    {/* --- 3. NEW LINK FOR VERIFIED LANDLORDS --- */}
                    {authUser.role === 'landlord' && authUser.isVerified && (
                        <Link to="/landlord/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-emerald-400 hover:bg-slate-700 rounded-md">
                            <FaChartBar /> Landlord Dashboard
                        </Link>
                    )}

                    <Link to="/payments" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white rounded-md"><FaCreditCard /> Payments</Link>
                    <Link to="/settings" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white rounded-md"><FaCog /> Settings</Link>
                </>
            ) : (
                <>
                    <Link to="/subscription" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-400 hover:bg-slate-700 rounded-md"><FaGem /> Subscription</Link>
                    <Link to="/login" onClick={handleLinkClick} className="block px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white rounded-md">Login</Link>
                    <Link to="/register" onClick={handleLinkClick} className="block px-3 py-2 text-base font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-md">Register</Link>
                </>
            )}
        </div>
    );

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[1001] bg-slate-900/50 backdrop-blur-lg border-b border-slate-700/50 transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/"><img src="/logo.png" alt="Nyumba Logo" className="h-12 w-auto logo-glow" /></Link>
                    </div>

                    {/* Desktop Links */}
                    {desktopLinks}

                    {/* Mobile Menu Button (hidden on desktop) */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (dropdown) */}
            <Transition
                show={isMobileMenuOpen}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div className="md:hidden">
                    {mobileLinks}
                </div>
            </Transition>
        </nav>
    );
};
export default Navbar;