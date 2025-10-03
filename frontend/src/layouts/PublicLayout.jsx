import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Your public Navbar component

const PublicLayout = () => {
  return (
    <div>
      <Navbar />
      <main>
        {/* Public pages like LandingPage will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;