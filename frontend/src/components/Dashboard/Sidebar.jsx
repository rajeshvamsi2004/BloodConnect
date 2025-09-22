import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaUser, FaPlus, FaPen, FaUsers, FaEnvelopeOpenText,
    FaArrowDown, FaCheck, FaTimes, FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    
    const handleLinkClick = () => {
        if (sidebarOpen) {
            setSidebarOpen(false);
        }
    };

    const handleLogout = () => {
        handleLinkClick();
        logout();
        navigate('/');
    };

    const linkClasses = "flex items-center p-3 text-gray-300 rounded-lg transition-colors duration-200 hover:bg-gray-700";
    const activeLinkClasses = "bg-red-600 text-white";
    const userName = user?.name || "Guest User";
    const navLinks = [
        { to: "/dashboard/profile", icon: <FaUser />, text: "Profile" },
        { to: "/dashboard/register-donor", icon: <FaPlus />, text: "Register as a Donor" },
        { to: "/dashboard/make-request", icon: <FaPen />, text: "Make Blood Request" },
        { to: "/dashboard/donors-list", icon: <FaUsers />, text: "Donors List" },
        { to: "/dashboard/incoming-requests", icon: <FaEnvelopeOpenText />, text: "Incoming Requests" },
        { to: "/dashboard/my-requests", icon: <FaArrowDown />, text: "My Requests" },
        { to: "/dashboard/accepted", icon: <FaCheck />, text: "Accepted" },
        { to: "/dashboard/rejected", icon: <FaTimes />, text: "Rejected" },
    ];

    return (
        <>
            {/* Backdrop overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-200 ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* The Sidebar */}
            <aside
                className={`flex flex-col absolute z-50 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 transform h-screen overflow-y-auto w-64 shrink-0 bg-[#1C2434] p-4 transition-all duration-200 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Sidebar Header */}
                <div className="flex justify-between mb-10 pr-3 sm:px-2">
                    <div className="pt-6">
                        <h2 className="text-white text-2xl font-semibold">{userName}</h2>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={handleLinkClick}
                            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                        >
                            <span className="mr-4 text-lg">{link.icon}</span>
                            {link.text}
                        </NavLink>
                    ))}
                </div>

                {/* Logout Button at the bottom */}
                <div className="pt-3 mt-auto">
                     <button
                        onClick={handleLogout}
                        className="flex items-center p-3 text-gray-300 w-full rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        <FaSignOutAlt className="mr-4 text-lg" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;