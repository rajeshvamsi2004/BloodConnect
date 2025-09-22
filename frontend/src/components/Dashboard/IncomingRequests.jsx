// src/components/Dashboard/IncomingRequests.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://bloodconnect-sev0.onrender.com';

const IncomingRequests = () => {
    const { userEmail } = useAuth();
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = async () => {
        if (!userEmail) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/pending-requests-for-donor`, {
                params: { email: userEmail }
            });
            setRequests(response.data);
        } catch (error) {
            toast.error('Failed to fetch incoming requests.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [userEmail]);

    const handleUpdateRequest = async (requestId, status) => {
        try {
            // We use the PUT endpoint here for in-app actions
            const response = await axios.put(`${API_BASE_URL}/blood-request/${requestId}`, { status });
            toast.success(response.data.message);
            
            // Remove the handled request from the list to prevent multiple actions
            setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));

        } catch (error) {
            toast.error('Failed to update the request status.');
        }
    };

    if (isLoading) {
        return <div className="text-center text-gray-600 mt-10">Loading incoming requests...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-red-700 mb-6 text-center">Incoming Donation Requests</h2>
            <p className="text-center text-gray-600 mb-8">
                These are pending requests that match your blood type. Please respond if you can help.
            </p>
            <div className="space-y-6">
                {requests.length > 0 ? (
                    requests.map(req => (
                        <div key={req._id} className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">
                                        Patient Name: {req.Name} (Age: {req.Age})
                                    </p>
                                    <p className="text-gray-600">
                                        Required Blood Group: <span className="font-bold text-red-600">{req.Blood}</span>
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Contact: {req.PhoneNumber}
                                    </p>
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleUpdateRequest(req._id, 'accepted')}
                                        className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300 shadow-md"
                                    >
                                        <i className="fas fa-check mr-2"></i> Accept
                                    </button>
                                    <button
                                        onClick={() => handleUpdateRequest(req._id, 'rejected')}
                                        className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300 shadow-md"
                                    >
                                        <i className="fas fa-times mr-2"></i> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-10">
                        There are no pending requests matching your blood type at the moment.
                    </p>
                )}
            </div>
        </div>
    );
};

export default IncomingRequests;