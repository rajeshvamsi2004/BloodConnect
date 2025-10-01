import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaHeartbeat, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ setSidebarOpen }) => {
    const { isAuthenticated } = useAuth();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCampsDropdownOpen, setCampsDropdownOpen] = useState(false);

    const navLinkClasses = ({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:bg-red-500 hover:text-white'
        }`;
    
    const dropdownButtonClasses = `px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-red-500 hover:text-white cursor-pointer`;
    
    const dropdownLinkClasses = ({ isActive }) =>
        `block px-4 py-2 text-sm ${
            isActive 
            ? 'bg-red-500 text-white' 
            : 'text-gray-700 hover:bg-gray-100'
        }`;

    const mobileNavLinkClasses = ({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium ${
            isActive
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
        }`;

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        {setSidebarOpen && (
                            <div className="flex md:hidden mr-4">
                                <button
                                    onClick={() => setSidebarOpen(prev => !prev)}
                                    type="button"
                                    className="p-2 rounded-md text-gray-500 hover:text-red-500"
                                >
                                    <span className="sr-only">Open sidebar</span>
                                    <FaBars className="block h-6 w-6" />
                                </button>
                            </div>
                        )}
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center">
                                <FaHeartbeat className="h-8 w-8 text-red-500" />
                                <span className="ml-2 text-2xl font-bold text-gray-800">BloodLink</span>
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <NavLink to="/" className={navLinkClasses}>Home</NavLink>
                            <NavLink to="/dashboard/register-donor" className={navLinkClasses}>Register as Donor</NavLink>
                            <NavLink to="/dashboard/make-request" className={navLinkClasses}>Blood Request</NavLink>
                            
                            {/* CHANGED: Corrected the path based on your App.js routes */}
                            <NavLink to="/dashboard/map" className={navLinkClasses}>Find Bloodbanks</NavLink>
                            
                            <div className="relative">
                                <button
                                    type="button"
                                    className={dropdownButtonClasses}
                                    onClick={() => setCampsDropdownOpen(prev => !prev)}
                                >
                                    Blood Camps
                                </button>
                                {isCampsDropdownOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            {/* CHANGED: Use absolute path */}
                                            <NavLink 
                                                to="/dashboard/camps"
                                                className={dropdownLinkClasses}
                                                onClick={() => setCampsDropdownOpen(false)}
                                            >
                                                Add Blood Camp
                                            </NavLink>
                                            {/* CHANGED: Use absolute path */}
                                            <NavLink 
                                                to="/dashboard/camplist"
                                                className={dropdownLinkClasses}
                                                onClick={() => setCampsDropdownOpen(false)}
                                            >
                                                Blood Camps List
                                            </NavLink>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="ml-6">
                            {!isAuthenticated && (
                                <Link
                                    to="/auth"
                                    className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Login / Sign Up
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                            type="button"
                            className="p-2 rounded-md text-gray-500 hover:text-red-500"
                            aria-controls="mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink to="/" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
                        <NavLink to="/dashboard/register-donor" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Register as Donor</NavLink>
                        <NavLink to="/dashboard/make-request" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Blood Request</NavLink>
                        
                        {/* CHANGED: Corrected the path based on your App.js routes */}
                        <NavLink to="/dashboard/map" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Find Bloodbanks</NavLink>
                        
                        {/* CHANGED: Use absolute paths for mobile as well */}
                        <NavLink to="/dashboard/camps" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Add Blood Camp</NavLink>
                        <NavLink to="/dashboard/camplist" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Blood Camps List</NavLink>
                        
                        <div className="mt-4 border-t border-gray-200 pt-4">
                             {isAuthenticated ? (
                                <Link
                                    to="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full text-center bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md text-base font-medium"
                                >
                                    Dashboard
                                </Link>
                             ) : (
                                <Link
                                    to="/auth"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full text-center bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md text-base font-medium"
                                >
                                    Login / Sign Up
                                </Link>
                             )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
