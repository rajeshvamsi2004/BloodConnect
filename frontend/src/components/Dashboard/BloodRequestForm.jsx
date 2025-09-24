// src/components/Dashboard/BloodRequestForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://bloodconnect-new.onrender.com';

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/blood-request`, formData);
            toast.success(response.data.message);
            // Optionally clear the form
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
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-red-700 mb-6 text-center">Request Blood</h2>
            <p className="text-center text-gray-600 mb-8">
                In need of blood? Fill out the form below and we'll notify matching donors.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
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
        </div>
    );
};

export default BloodRequestForm;
