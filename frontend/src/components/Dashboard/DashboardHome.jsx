import React from 'react';
import ImageCarousel from './Carousel';

const DashboardHome = () => {
    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-4">Welcome to Your Dashboard</h1>
            <p className="text-lg text-gray-600 mb-8">
                You can manage your donations, requests, and profile using the options in the sidebar.
            </p>
            
            {/* This container makes the carousel look neat on desktop */}
            <div className="max-w-5xl mx-auto rounded-lg overflow-hidden shadow-xl">
                <ImageCarousel />
            </div>
        </div>
    );
};

export default DashboardHome;