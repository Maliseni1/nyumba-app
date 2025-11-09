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
    FaChartBar,
    FaGift,
    FaComments,
    FaFileUpload // --- 1. IMPORT NEW ICON ---
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
                    <span className="text-subtle-text-color hidden sm:block">Welcome, {authUser.name}</span>
                    <Link to="/map" title="Map View" className="text-subtle-text-color hover:text-text-color transition-colors text-2xl"><FaMap /></Link>
                    <Link to="/forum" title="Community Hub" className="text-subtle-text-color hover:text-text-color transition-colors text-2xl"><FaComments /></Link>
                    
                    {authUser.isAdmin && (
                        <Link to="/admin/dashboard" title="Admin Dashboard" className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors text-2xl"><FaTachometerAlt /></Link>
                    )}
                    <Link to="/profile" title="Profile" className="text-subtle-text-color hover:text-text-color transition-colors text-2xl"><FaUserCircle /></Link>
                    <Link to="/messages" title="Messages" className="relative text-subtle-text-color hover:text-text-color transition-colors text-2xl">
                        <FaEnvelope />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </Link>
                    
                    {/* --- 2. ADD LANDLORD LINKS (including new Bulk Upload) --- */}
                    {authUser.role === 'landlord' && (
                        <>
                            <Link to="/add-listing" title="Add Listing" className="text-accent-color hover:text-accent-hover-color transition-colors text-2xl"><FaPlusSquare /></Link>
                            <Link to="/landlord/bulk-upload" title="Bulk Upload" className="text-accent-color hover:text-accent-hover-color transition-colors text-2xl"><FaFileUpload /></Link>
                        </>
                    )}
                    {authUser.role === 'landlord' && authUser.isVerified && (
                        <Link to="/landlord/dashboard" title="Landlord Dashboard" className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors text-2xl"><FaChartBar /></Link>
                    )}
                    {/* --- END LANDLORD LINKS --- */}

                    <Link to="/payments" title="Payment History" className="text-subtle-text-color hover:text-text-color transition-colors text-2xl"><FaCreditCard /></Link>
                    <Link to="/rewards" title="My Rewards" className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors text-2xl"><FaGift /></Link>
                    <Link to="/settings" title="Settings" className="text-subtle-text-color hover:text-text-color transition-colors text-2xl"><FaCog /></Link>
                </>
            ) : (
                <>
                    <Link to="/subscription" title="Subscription" className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors text-2xl"><FaGem /></Link>
                    <Link to="/login" className="text-subtle-text-color hover:text-text-color transition-colors">Login</Link>
                    <Link to="/register" className="bg-accent-color hover:bg-accent-hover-color text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Register</Link>
                </>
            )}
        </div>
    );

    // --- MOBILE LINKS (the vertical dropdown) ---
    const mobileLinks = (
        <div className="px-2 pt-2 pb-3 space-y-1">
            {authUser ? (
                <>
                    <Link to="/map" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaMap /> Map View</Link>
                    <Link to="/forum" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaComments /> Community</Link>
                    
                    {authUser.isAdmin && (
                        <Link to="/admin/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-yellow-500 dark:text-yellow-400 hover:bg-border-color rounded-md"><FaTachometerAlt /> Admin Dashboard</Link>
                    )}
                    <Link to="/profile" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaUserCircle /> Profile</Link>
                    <Link to="/messages" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaEnvelope /> Messages {unreadCount > 0 && `(${unreadCount})`}</Link>
                    
                    {/* --- 3. ADD LANDLORD LINKS (including new Bulk Upload) --- */}
                    {authUser.role === 'landlord' && (
                        <>
                            <Link to="/add-listing" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-accent-color hover:bg-border-color rounded-md"><FaPlusSquare /> Add Listing</Link>
                            <Link to="/landlord/bulk-upload" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-accent-color hover:bg-border-color rounded-md"><FaFileUpload /> Bulk Upload</Link>
                        </>
                    )}
                    {authUser.role === 'landlord' && authUser.isVerified && (
                        <Link to="/landlord/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-emerald-500 dark:text-emerald-400 hover:bg-border-color rounded-md">
                            <FaChartBar /> Landlord Dashboard
                        </Link>
                    )}
                    {/* --- END LANDLORD LINKS --- */}

                    <Link to="/payments" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaCreditCard /> Payments</Link>
                    
                    <Link to="/rewards" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-500 dark:text-amber-400 hover:bg-border-color rounded-md">
                        <FaGift /> My Rewards
                    </Link>
                    
                    <Link to="/settings" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaCog /> Settings</Link>
                </>
            ) : (
                <>
                    <Link to="/subscription" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-500 dark:text-amber-400 hover:bg-border-color rounded-md"><FaGem /> Subscription</Link>
                    <Link to="/login" onClick={handleLinkClick} className="block px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md">Login</Link>
                    <Link to="/register" onClick={handleLinkClick} className="block px-3 py-2 text-base font-medium text-white bg-accent-color hover:bg-accent-hover-color rounded-md">Register</Link>
                    {/* The typo 'Verify' was here, I removed it. */}
                </>
            )}
        </div>
    );

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 bg-card-color backdrop-blur-lg border-b border-border-color transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}
            style={{ zIndex: 100 }}
        >
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="Nyumba Logo" className="h-12 w-auto logo-glow" />
                            <span className="font-bold text-2xl text-text-color hidden sm:block">Nyumba</span>
                        </Link>
                    </div>

                    {desktopLinks}

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-subtle-text-color hover:text-text-color hover:bg-border-color focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-color"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

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