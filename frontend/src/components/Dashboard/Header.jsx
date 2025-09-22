import React from 'react';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 bg-white border-b border-gray-200 z-20">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 -mb-px">
                    {/* Hamburger button for mobile - hidden on desktop */}
                    <div className="flex">
                        <button
                            className="text-gray-500 hover:text-gray-600 lg:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <FaBars className="w-6 h-6 fill-current" />
                        </button>
                    </div>

                    {/* User info on the right */}
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                           <div className="font-semibold text-gray-700">{user?.name || "User"}</div>
                           <div className="text-xs text-gray-500">{user?.role || "Donor"}</div>
                        </div>
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                           {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;