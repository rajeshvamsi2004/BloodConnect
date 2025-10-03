// src/layouts/RootLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { DashboardProvider } from '../context/DashboardContext';

const RootLayout = () => {
  return (
    // The DashboardProvider wraps the ENTIRE app, so Navbar and Sidebar can share state
    <DashboardProvider>
      <div className="flex flex-col h-screen">
        <Navbar />
        {/* The rest of the app (layouts and pages) will render here */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </DashboardProvider>
  );
};

export default RootLayout;