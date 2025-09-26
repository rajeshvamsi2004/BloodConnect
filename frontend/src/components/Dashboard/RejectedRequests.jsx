// src/components/Dashboard/RejectedRequests.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://bloodconnect-9fxm.onrender.com';

const RejectedRequests = () => {
    const { userEmail } = useAuth();
    const [rejectedRequests, setRejectedRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!userEmail) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/my-requests`, {
                    params: { email: userEmail }
                });
                // Filter for rejected requests
                const filtered = response.data.filter(req => req.Status === 'rejected');
                setRejectedRequests(filtered);
            } catch (error) {
                toast.error('Failed to fetch your requests.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [userEmail]);


    if (isLoading) {
        return <div className="text-center text-gray-600 mt-10">Loading rejected requests...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-red-700 mb-6 text-center">Rejected Blood Requests</h2>
            <div className="space-y-4">
                {rejectedRequests.length > 0 ? (
                    rejectedRequests.map(req => (
                        <div key={req._id} className="p-6 border border-red-200 rounded-lg shadow-sm bg-red-50">
                            <div>
                                <p className="text-lg font-semibold text-gray-800">Patient: {req.Name}</p>
                                <p className="text-gray-600">Required Blood: <span className="font-bold">{req.Blood}</span></p>
                                <p className="text-gray-500 mt-2">
                                    We're sorry, this request could not be fulfilled at this time.
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-10">You have no rejected blood requests.</p>
                )}
            </div>
        </div>
    );
};

export default RejectedRequests;
