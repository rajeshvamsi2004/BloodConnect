import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import DonorModal from './DonorModal'; // <-- STEP 1: Import the new component

const API_BASE_URL = 'https://bloodconnect-sev0.onrender.com';

const AcceptedRequests = () => {
    const { userEmail } = useAuth();
    const [acceptedRequests, setAcceptedRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDonor, setModalDonor] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    useEffect(() => {
        // ... (The useEffect hook for fetching requests remains the same)
        const fetchRequests = async () => {
            if (!userEmail) return;
            setIsLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/my-requests`, {
                    params: { email: userEmail }
                });
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

    const handleViewDonor = async (requestId) => {
        // ... (This function for fetching the donor details remains the same)
        setIsModalOpen(true);
        setIsModalLoading(true);
        setModalDonor(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/accepted/${requestId}`, {
                params: { email: userEmail }
            });
            if (response.data.status === 'accepted' && response.data.donors.length > 0) {
                setModalDonor(response.data.donors[0]);
            } else {
                toast.info('Could not find the accepted donor for this request.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch donor details.');
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
                                    onClick={() => handleViewDonor(req._id)}
                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300"
                                >
                                    View Donor Details
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-10">You have no accepted blood requests.</p>
                    )}
                </div>
            </div>

            {/* STEP 2: Use the imported component here */}
            {isModalOpen && (
                <DonorModal
                    donor={modalDonor}
                    isLoading={isModalLoading}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default AcceptedRequests;
