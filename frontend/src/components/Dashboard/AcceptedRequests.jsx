// src/components/Dashboard/AcceptedRequests.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://192.168.137.1:4000';

// A simple Modal component
const DonorModal = ({ donors, isLoading, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                <h3 className="text-2xl font-bold text-red-700 mb-6 text-center">Available Donors</h3>
                {isLoading ? (
                    <p className="text-center text-gray-600">Loading donors...</p>
                ) : donors.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {donors.map(donor => (
                            <div key={donor._id} className="p-4 border rounded-lg bg-gray-50">
                                <p className="font-semibold text-gray-800">{donor.Name}</p>
                                <p className="text-sm text-gray-600">Blood Group: <span className="font-bold">{donor.Blood}</span></p>
                                <p className="text-sm text-gray-600">Contact: {donor.Email} | {donor.PhoneNumber}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-10">No donors found for this request.</p>
                )}
            </div>
        </div>
    );
};


const AcceptedRequests = () => {
    const { userEmail } = useAuth();
    const [acceptedRequests, setAcceptedRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDonors, setModalDonors] = useState([]);
    const [isModalLoading, setIsModalLoading] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!userEmail) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/my-requests`, {
                    params: { email: userEmail }
                });
                // Filter for accepted requests
                const filtered = response.data.filter(req => req.Status === 'accepted');
                setAcceptedRequests(filtered);
            } catch (error) {
                toast.error('Failed to fetch your requests.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRequests();
    }, [userEmail]);

    const handleViewDonors = async (requestId) => {
        setIsModalOpen(true);
        setIsModalLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/accepted/${requestId}`, {
                params: { email: userEmail }
            });
            if (response.data.status === 'accepted') {
                setModalDonors(response.data.donors);
            } else {
                toast.info(response.data.message);
                setModalDonors([]);
            }
        } catch (error) {
            console.error('Error fetching accepted donors:', error);
            toast.error(error.response?.data.message || 'Failed to fetch donor details.');
        } finally {
            setIsModalLoading(false);
        }
    };

    if (isLoading) {
        return <div className="text-center text-gray-600 mt-10">Loading accepted requests...</div>;
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">Accepted Blood Requests</h2>
                <div className="space-y-4">
                    {acceptedRequests.length > 0 ? (
                        acceptedRequests.map(req => (
                            <div key={req._id} className="p-6 border border-green-200 rounded-lg shadow-sm bg-green-50 flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">Patient: {req.Name}</p>
                                    <p className="text-gray-600">Required Blood: <span className="font-bold text-red-600">{req.Blood}</span></p>
                                </div>
                                <button
                                    onClick={() => handleViewDonors(req._id)}
                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300"
                                >
                                    View Available Donors
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-10">You have no accepted blood requests.</p>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <DonorModal
                    donors={modalDonors}
                    isLoading={isModalLoading}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default AcceptedRequests;