import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Your main Navbar

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* The main navbar will always be at the top */}
            <Navbar />
            
            {/* The rest of the page content will be rendered here */}
            <main className="flex-grow">
                <Outlet />
            </main>
            
            {/* You could add a Footer component here if you have one */}
        </div>
    );
};

export default MainLayout;