// src/components/Dashboard/DonorsList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://blood-connect-orcin.vercel.app';

const DonorsList = () => {
    const [donors, setDonors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDonors = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/donors`);
                setDonors(response.data);
            } catch (error) {
                console.error('Error fetching donors:', error);
                toast.error('Failed to fetch donors list.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDonors();
    }, []);

    if (isLoading) {
        return <div className="text-center text-gray-600 mt-10">Loading donors...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-red-700 mb-6 text-center">Registered Donors</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-red-600 text-white">
                        <tr>
                            <th className="py-3 px-6 text-left">Name</th>
                            <th className="py-3 px-6 text-left">Blood Group</th>
                            <th className="py-3 px-6 text-left">Age</th>
                            <th className="py-3 px-6 text-left">Contact Email</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {donors.map((donor) => (
                            <tr key={donor._id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6">{donor.Name}</td>
                                <td className="py-3 px-6 font-bold">{donor.Blood}</td>
                                <td className="py-3 px-6">{donor.Age}</td>
                                <td className="py-3 px-6">{donor.Email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {donors.length === 0 && <p className="text-center text-gray-500 py-10">No donors found.</p>}
            </div>
        </div>
    );
};

export default DonorsList;
