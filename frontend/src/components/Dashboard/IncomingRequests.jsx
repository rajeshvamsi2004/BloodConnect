import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // No change here
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://blood-connect-orcin.vercel.app';

const IncomingRequests = () => {
    // --- CHANGE 1: Get the full 'user' object from your AuthContext ---
    // This 'user' object will contain the donor's _id, Name, etc.
    const { user, userEmail } = useAuth(); 
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
        fetchRequests();
    }, [userEmail]);

    const handleUpdateRequest = async (requestId, status) => {
        // --- CHANGE 2: Check if we have the donor's info before proceeding ---
        if (!user || !user._id) {
            toast.error("Could not identify the donor. Please try logging in again.");
            return;
        }

        try {
            // --- CHANGE 3: Include the donorId in the request body ---
            // This now matches what your backend API requires.
            const response = await axios.put(`${API_BASE_URL}/blood-request/${requestId}`, {
                status: status,
                donorId: user._id // The CRITICAL piece of missing information
            });
            
            toast.success(response.data.message);
            
            // This is good practice: remove the request from the UI after handling it.
            setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));

        } catch (error) {
            // The error toast will now show more specific messages from the backend
            toast.error(error.response?.data?.message || 'Failed to update the request status.');
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
                            <div className="flex justify-between items-center flex-wrap gap-4">
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
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleUpdateRequest(req._id, 'rejected')}
                                        className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300 shadow-md"
                                    >
                                        Reject
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
