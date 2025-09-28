// src/components/Dashboard/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://save-o4h7.onrender.com';

const Profile = () => {
  const { userEmail } = useAuth();
  const [profileData, setProfileData] = useState({
    Username: '',
    Email: userEmail,
    Name: '',
    Age: '',
    Blood: '',
    PhoneNumber: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userEmail) {
        setIsLoading(false);
        toast.error('User email not found. Please log in again.');
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/profile/${userEmail}`);
        setProfileData(prev => ({
          ...prev,
          ...response.data, // This will overwrite with donor/general user data
          // Ensure Username is populated from general registration if Name is not present (for non-donors)
          Username: response.data.Username || response.data.Name || '',
          Name: response.data.Name || response.data.Username || '', // Prioritize donor name, then general username
        }));
        toast.success("Profile loaded!");
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(error.response?.data || 'Failed to fetch profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userEmail]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/profile/${userEmail}`, {
        Name: profileData.Name, // Assuming the backend /profile/:email expects Name for donor updates
        Age: profileData.Age,
        Blood: profileData.Blood,
        PhoneNumber: profileData.PhoneNumber,
        // Don't update email or username via this endpoint
      });
      setProfileData(prev => ({ ...prev, ...response.data.profile })); // Update with new data from backend
      setIsEditing(false);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-red-700 mb-6 text-center">My Profile</h2>

      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label htmlFor="Name" className="block text-gray-700 text-sm font-semibold mb-2">Name</label>
            <input
              type="text"
              id="Name"
              name="Name"
              value={profileData.Name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label htmlFor="Age" className="block text-gray-700 text-sm font-semibold mb-2">Age</label>
            <input
              type="number"
              id="Age"
              name="Age"
              value={profileData.Age}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label htmlFor="Blood" className="block text-gray-700 text-sm font-semibold mb-2">Blood Group</label>
            <select
              id="Blood"
              name="Blood"
              value={profileData.Blood}
              onChange={handleChange}
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
              value={profileData.PhoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-full px-6 py-3 rounded-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <strong className="text-gray-600">Name:</strong>
            <p className="text-gray-800 text-lg">{profileData.Name || 'Not set'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <strong className="text-gray-600">Email:</strong>
            <p className="text-gray-800 text-lg">{profileData.Email}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <strong className="text-gray-600">Age:</strong>
            <p className="text-gray-800 text-lg">{profileData.Age || 'Not set'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <strong className="text-gray-600">Blood Group:</strong>
            <p className="text-gray-800 text-lg">{profileData.Blood || 'Not set'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <strong className="text-gray-600">Phone Number:</strong>
            <p className="text-gray-800 text-lg">{profileData.PhoneNumber || 'Not set'}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="w-full mt-6 px-6 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition duration-300"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
