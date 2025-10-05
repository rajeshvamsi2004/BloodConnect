// src/components/Dashboard/BloodRequestForm.js
import React, { useState, useEffect } from 'react'; // --- MODIFIED ---
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns'; // --- ADDED ---

const API_BASE_URL = 'https://blood-connect-orcin.vercel.app';

const BloodRequestForm = () => {
    const { userEmail } = useAuth();
    const [formData, setFormData] = useState({
        Name: '',
        Age: '',
        Blood: '',
        Email: userEmail,
        PhoneNumber: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    
    // --- ADDED ---: State to hold and display the user's past requests
    const [myRequests, setMyRequests] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    // --- ADDED ---: useEffect to fetch the user's requests when the component loads
    useEffect(() => {
        // We only fetch requests if the user's email is available
        if (userEmail) {
            const fetchMyRequests = async () => {
                setIsFetching(true);
                try {
                    // IMPORTANT: You need an API endpoint like this that returns requests for a specific email
                    const response = await axios.get(`${API_BASE_URL}/requests/my-requests?email=${userEmail}`);
                    setMyRequests(response.data);
                } catch (error) {
                    console.error('Error fetching user requests:', error);
                    // Don't show an error toast on initial load unless it's critical
                } finally {
                    setIsFetching(false);
                }
            };
            fetchMyRequests();
        }
    }, [userEmail]); // This effect runs whenever userEmail changes

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/blood-request`, formData);
            toast.success(response.data.message);

            // --- ADDED ---: Add the new request to the top of the list for immediate display
            // This assumes your API returns the newly created request object upon success
            if (response.data.request) {
                setMyRequests(prevRequests => [response.data.request, ...prevRequests]);
            }

            // Clear the form
            setFormData({
                Name: '', Age: '', Blood: '', Email: userEmail, PhoneNumber: '',
            });
        } catch (error) {
            console.error('Error creating blood request:', error);
            toast.error(error.response?.data || 'Failed to create request.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // --- MODIFIED ---: Changed from max-w-2xl to max-w-4xl to make space for the list
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto"> 
            <h2 className="text-3xl font-bold text-red-700 mb-6 text-center">Request Blood</h2>
            <p className="text-center text-gray-600 mb-8">
                In need of blood? Fill out the form below and we'll notify matching donors.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form inputs remain the same... */}
                <div>
                    <label htmlFor="Name" className="block text-gray-700 text-sm font-semibold mb-2">Patient's Full Name</label>
                    <input type="text" id="Name" name="Name" value={formData.Name} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                    <label htmlFor="Age" className="block text-gray-700 text-sm font-semibold mb-2">Patient's Age</label>
                    <input type="number" id="Age" name="Age" value={formData.Age} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                    <label htmlFor="Blood" className="block text-gray-700 text-sm font-semibold mb-2">Required Blood Group</label>
                    <select id="Blood" name="Blood" value={formData.Blood} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="PhoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">Contact Phone Number</label>
                    <input type="tel" id="PhoneNumber" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                    <label htmlFor="Email" className="block text-gray-700 text-sm font-semibold mb-2">Contact Email (Your Email)</label>
                    <input type="email" id="Email" name="Email" value={userEmail} readOnly className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full mt-6 px-6 py-4 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition duration-300 disabled:bg-gray-400">
                    {isLoading ? 'Submitting Request...' : 'Send Blood Request'}
                </button>
            </form>

            {/* --- ADDED ---: Section to display the user's sent requests */}
            <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Sent Requests</h3>
                {isFetching ? (
                    <p>Loading your requests...</p>
                ) : myRequests.length > 0 ? (
                    <div className="space-y-4">
                        {myRequests.map((request) => (
                            <div key={request._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg text-gray-900">{request.Name}, Age: {request.Age}</p>
                                        <p className="text-sm text-gray-600">Status: <span className="font-medium capitalize">{request.Status}</span></p>
                                    </div>
                                    <span className="bg-red-100 text-red-700 font-bold py-1 px-3 rounded-full">{request.Blood}</span>
                                </div>
                                {/* --- THIS IS THE REQUESTED TIME AND DATE --- */}
                                <div className="text-right text-xs text-gray-500 mt-3 pt-3 border-t">
                                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 bg-gray-100 p-4 rounded-lg">You have not sent any requests yet.</p>
                )}
            </div>
        </div>
    );
};

export default BloodRequestForm;
