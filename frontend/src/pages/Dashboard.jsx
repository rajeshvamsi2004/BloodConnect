import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import Navbar from '../components/Navbar'; // Your existing Navbar
import ImageCarousel from '../components/Dashboard/Carousel';

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar: Handles its own state for mobile vs. desktop */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                
                {/* Navbar (Header): Now sticky to the top of THIS container */}
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* The rest of the page content will scroll underneath the navbar */}
                <main>
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
                        <ImageCarousel />
                        
                        <div className="mt-8"> {/* Added margin-top for spacing */}
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;