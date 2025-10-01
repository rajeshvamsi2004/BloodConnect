import React, { useState, useEffect } from 'react';
import { FiHome, FiUser, FiSettings } from 'react-icons/fi';
import { BiDonateBlood } from 'react-icons/bi';


const BloodCampList = () => {
    const [camps, setCamps] = useState([]);
    const [filteredCamps, setFilteredCamps] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch camps from the API
    useEffect(() => {
        const fetchCamps = async () => {
            try {
                // Ensure your backend is running on this port
                const response = await fetch('http://localhost:4000/api/blood-camps');
                const data = await response.json();
                setCamps(data);
                setFilteredCamps(data);
            } catch (error) {
                console.error("Failed to fetch blood camps:", error);
            }
        };

        fetchCamps();
    }, []);

    // Handle search input changes
    useEffect(() => {
        const results = camps.filter(camp =>
            camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            camp.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCamps(results);
    }, [searchTerm, camps]);


    return (
        <div className="bg-gray-50 font-sans min-h-screen">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <header className="flex items-center p-4">
                    <button className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xl">
                        ←
                    </button>
                    <h1 className="text-xl font-bold text-center flex-grow pr-8">Blood Camps</h1>
                </header>

                {/* Search Bar */}
                <div className="px-4 mb-6">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search blood camps"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-none rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                    </div>
                </div>

                {/* Camps List */}
                <main className="px-4 space-y-4 pb-24">
                    {filteredCamps.map(camp => (
                        <div key={camp._id} className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-lg text-gray-800">{camp.name}</h2>
                                <p className="text-gray-600">{camp.address}</p>
                                <p className="text-gray-500 text-sm mt-1">{camp.time}</p>
                            </div>
                            <span className="text-red-500 text-2xl">→</span>
                        </div>
                    ))}
                </main>
            </div>

             {/* Bottom Navigation */}
             
        </div>
    );
};

export default BloodCampList;
