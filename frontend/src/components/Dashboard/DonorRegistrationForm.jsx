// src/components/Dashboard/DonorRegistrationForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://192.168.137.1:4000';

const DonorRegistrationForm = () => {
  const { userEmail } = useAuth();
  const navigate = useNavigate();
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
      const response = await axios.post(`${API_BASE_URL}/donor`, formData);
      toast.success(response.data);
      navigate('/dashboard/profile'); // Redirect to profile after successful registration
    } catch (error) {
      console.error('Error registering donor:', error);
      toast.error(error.response?.data || 'Server Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-red-700 mb-6 text-center">Become a Donor</h2>
      <p className="text-center text-gray-600 mb-8">
        Thank you for your interest in saving lives. Please fill out the form below to be registered as a donor.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="Name" className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
          <input
            type="text"
            id="Name"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="Age" className="block text-gray-700 text-sm font-semibold mb-2">Age</label>
          <input
            type="number"
            id="Age"
            name="Age"
            value={formData.Age}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="25"
          />
        </div>
        <div>
          <label htmlFor="Blood" className="block text-gray-700 text-sm font-semibold mb-2">Blood Group</label>
          <select
            id="Blood"
            name="Blood"
            value={formData.Blood}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
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
          <label htmlFor="PhoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">Phone Number</label>
          <input
            type="tel"
            id="PhoneNumber"
            name="PhoneNumber"
            value={formData.PhoneNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="123-456-7890"
          />
        </div>
        <div>
          <label htmlFor="Email" className="block text-gray-700 text-sm font-semibold mb-2">Email Address (Cannot be changed)</label>
          <input
            type="email"
            id="Email"
            name="Email"
            value={userEmail}
            readOnly
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 px-6 py-4 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition duration-300 disabled:bg-gray-400"
        >
          {isLoading ? 'Submitting...' : 'Register as Donor'}
        </button>
      </form>
    </div>
  );
};

export default DonorRegistrationForm;