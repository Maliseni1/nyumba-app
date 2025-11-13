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
    FaFileUpload,
    FaHeadset,
    FaSlidersH,
    FaCalculator,
    FaSignOutAlt,
    FaChevronDown,
    FaIdBadge
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';

// --- 1. REMOVED THE FAULTY DropdownLink COMPONENT ---


const Navbar = () => {
    const { authUser, unreadCount, logout } = useAuth();
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
    
    const isPremium = authUser && authUser.subscriptionStatus === 'active';

    // --- 2. REBUILT THE DESKTOP LINKS ---
    const desktopLinks = (
        <div className="hidden md:flex items-center space-x-6">
            {authUser ? (
                <>
                    {/* --- High-Frequency Actions (unchanged) --- */}
                    <Link to="/map" title="Map View" className="text-subtle-text-color hover:text-text-color transition-colors text-2xl"><FaMap /></Link>
                    <Link to="/forum" title="Community Hub" className="text-subtle-text-color hover:text-text-color transition-colors text-2xl"><FaComments /></Link>
                    
                    {isPremium && (
                        <Link to="/support" title="Premium Support" className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors text-2xl"><FaHeadset /></Link>
                    )}
                    
                    {authUser.role === 'landlord' && (
                        <Link to="/add-listing" title="Add Listing" className="text-emerald-500 hover:text-emerald-400 transition-colors text-2xl"><FaPlusSquare /></Link>
                    )}

                    <Link to="/messages" title="Messages" className="relative text-subtle-text-color hover:text-text-color transition-colors text-2xl">
                        <FaEnvelope />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </Link>
                    
                    {/* --- 3. REBUILT PROFILE DROPDOWN (THIS IS THE FIX) --- */}
                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center gap-2 text-subtle-text-color hover:text-text-color transition-colors">
                            <FaUserCircle className="text-2xl" />
                            <FaChevronDown className="h-3 w-3" />
                        </Menu.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right bg-card-color divide-y divide-border-color rounded-md shadow-lg ring-1 ring-border-color focus:outline-none z-20">
                                <div className="px-4 py-3">
                                    <p className="text-sm font-medium text-text-color truncate">{authUser.name}</p>
                                    <p className="text-xs text-subtle-text-color truncate">{authUser.email}</p>
                                </div>
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link to="/profile" className={`flex items-center gap-3 px-4 py-2 text-sm ${active ? 'bg-border-color text-text-color' : 'text-subtle-text-color'}`}>
                                                <FaIdBadge className="w-5 h-5" /> Profile
                                            </Link>
                                        )}
                                    </Menu.Item>
                                    {authUser.role === 'tenant' && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link to="/preferences" className={`flex items-center gap-3 px-4 py-2 text-sm ${active ? 'bg-border-color text-text-color' : 'text-subtle-text-color'}`}>
                                                    <FaSlidersH className="w-5 h-5" /> My Preferences
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {authUser.role === 'landlord' && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link to="/landlord/bulk-upload" className={`flex items-center gap-3 px-4 py-2 text-sm ${active ? 'bg-border-color text-emerald-400' : 'text-emerald-500'}`}>
                                                    <FaFileUpload className="w-5 h-5" /> Bulk Upload
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {authUser.role === 'landlord' && authUser.verificationStatus === 'approved' && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link to="/landlord/dashboard" className={`flex items-center gap-3 px-4 py-2 text-sm ${active ? 'bg-border-color text-emerald-400' : 'text-emerald-500'}`}>
                                                    <FaChartBar className="w-5 h-5" /> Landlord Dashboard
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {authUser.isAdmin && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link to="/admin/dashboard" className={`flex items-center gap-3 px-4 py-2 text-sm ${active ? 'bg-border-color text-yellow-400' : 'text-yellow-500'}`}>
                                                    <FaTachometerAlt className="w-5 h-5" /> Admin Dashboard
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    )}
                                </div>
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link to="/rewards" className={`flex items-center gap-3 px-4 py-2 text-sm ${active ? 'bg-border-color text-amber-400' : 'text-amber-500'}`}>
                                                <FaGift className="w-5 h-5" /> My Rewards
                                            </Link>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link to="/payments" className={`flex items-center gap-3 px-4 py-2 text-sm ${active ? 'bg-border-color text-text-color' : 'text-subtle-text-color'}`}>
                                                <FaCreditCard className="w-5 h-5" /> Payment History
                                            </Link>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link to="/settings" className={`flex items-center gap-3 px-4 py-2 text-sm ${active ? 'bg-border-color text-text-color' : 'text-subtle-text-color'}`}>
                                                <FaCog className="w-5 h-5" /> Settings
                                            </Link>
                                        )}
                                    </Menu.Item>
                                </div>
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button onClick={logout} className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm ${active ? 'bg-border-color text-red-400' : 'text-red-500'}`}>
                                                <FaSignOutAlt className="w-5 h-5" /> Logout
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </>
            ) : (
                <>
                    {/* Logged-out links (unchanged) */}
                    <Link to="/budget-calculator" title="Budget Calculator" className="text-subtle-text-color hover:text-text-color transition-colors text-2xl"><FaCalculator /></Link>
                    <Link to="/subscription" title="Subscription" className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors text-2xl"><FaGem /></Link>
                    <Link to="/login" className="text-subtle-text-color hover:text-text-color transition-colors">Login</Link>
                    <Link to="/register" className="bg-accent-color hover:bg-accent-hover-color text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Register</Link>
                </>
            )}
        </div>
    );

    // --- 4. REBUILT MOBILE LINKS (To match colors) ---
    const mobileLinks = (
        <div className="px-2 pt-2 pb-3 space-y-1">
            {authUser ? (
                <>
                    {/* Main Actions */}
                    <Link to="/map" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaMap /> Map View</Link>
                    <Link to="/forum" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaComments /> Community</Link>
                    <Link to="/messages" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaEnvelope /> Messages {unreadCount > 0 && `(${unreadCount})`}</Link>
                    {isPremium && (
                        <Link to="/support" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-500 dark:text-amber-400 hover:bg-border-color rounded-md"><FaHeadset /> Premium Support</Link>
                    )}
                    
                    {/* Role-Specific Actions */}
                    {authUser.role === 'landlord' && (
                        <>
                            <Link to="/add-listing" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-emerald-500 hover:bg-border-color rounded-md"><FaPlusSquare /> Add Listing</Link>
                            <Link to="/landlord/bulk-upload" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-emerald-500 hover:bg-border-color rounded-md"><FaFileUpload /> Bulk Upload</Link>
                        </>
                    )}
                    {authUser.role === 'tenant' && (
                        <Link to="/preferences" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaSlidersH /> My Preferences</Link>
                    )}

                    {/* Divider */}
                    <div className="border-t border-border-color my-2"></div>
                    
                    {/* Management Links */}
                    <Link to="/profile" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaIdBadge /> Profile</Link>
                    {authUser.role === 'landlord' && authUser.verificationStatus === 'approved' && (
                        <Link to="/landlord/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-emerald-500 dark:text-emerald-400 hover:bg-border-color rounded-md"><FaChartBar /> Landlord Dashboard</Link>
                    )}
                    {authUser.isAdmin && (
                        <Link to="/admin/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-yellow-500 dark:text-yellow-400 hover:bg-border-color rounded-md"><FaTachometerAlt /> Admin Dashboard</Link>
                    )}
                    <Link to="/rewards" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-500 dark:text-amber-400 hover:bg-border-color rounded-md"><FaGift /> My Rewards</Link>
                    <Link to="/payments" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaCreditCard /> Payments</Link>
                    <Link to="/settings" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaCog /> Settings</Link>
                    
                    {/* Divider */}
                    <div className="border-t border-border-color my-2"></div>

                    {/* Logout */}
                    <button 
                        onClick={() => { handleLinkClick(); logout(); }} 
                        className="w-full flex items-center gap-3 px-3 py-2 text-base font-medium text-red-500 hover:bg-border-color hover:text-red-400 rounded-md"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </>
            ) : (
                <>
                    {/* Logged-out links */}
                    <Link to="/budget-calculator" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md"><FaCalculator /> Budget Calculator</Link>
                    <Link to="/subscription" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-500 dark:text-amber-400 hover:bg-border-color rounded-md"><FaGem /> Subscription</Link>
                    <Link to="/login" onClick={handleLinkClick} className="block px-3 py-2 text-base font-medium text-subtle-text-color hover:bg-border-color hover:text-text-color rounded-md">Login</Link>
                    <Link to="/register" onClick={handleLinkClick} className="block px-3 py-2 text-base font-medium text-white bg-accent-color hover:bg-accent-hover-color rounded-md">Register</Link>
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