// src/components/Dashboard/MyRequests.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://bloodconnect-9fxm.onrender.com';

const MyRequests = () => {
    const { userEmail } = useAuth();
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!userEmail) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/my-requests`, {
                    params: { email: userEmail }
                });
                setRequests(response.data);
            } catch (error) {
                console.error('Error fetching my requests:', error);
                toast.error('Failed to fetch your requests.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [userEmail]);
    
    const getStatusChip = (status) => {
      switch (status.toLowerCase()) {
        case 'pending':
          return <span className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-200 rounded-full">Pending</span>;
        case 'accepted':
          return <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded-full">Accepted</span>;
        case 'rejected':
          return <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-200 rounded-full">Rejected</span>;
        default:
          return <span className="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-200 rounded-full">{status}</span>;
      }
    };


    if (isLoading) {
        return <div className="text-center text-gray-600 mt-10">Loading your requests...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-red-700 mb-6 text-center">My Blood Requests</h2>
            <div className="space-y-4">
                {requests.length > 0 ? (
                    requests.map(req => (
                        <div key={req._id} className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50 flex justify-between items-center">
                            <div>
                                <p className="text-lg font-semibold text-gray-800">
                                    Patient: {req.Name} (Age: {req.Age})
                                </p>
                                <p className="text-gray-600">
                                    Required Blood Group: <span className="font-bold text-red-600">{req.Blood}</span>
                                </p>
                                <p className="text-sm text-gray-500">
                                    Request ID: {req._id}
                                </p>
                            </div>
                            <div>
                                {getStatusChip(req.Status)}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-10">You have not made any blood requests yet.</p>
                )}
            </div>
        </div>
    );
};

export default MyRequests;
