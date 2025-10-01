import React, { useState, useEffect } from 'react';

const BloodCampManager = () => {
    // --- PASSWORD SETUP ---
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const CORRECT_PASSWORD = 'admin';

    // --- EXISTING STATES ---
    const [camps, setCamps] = useState([]);
    const [form, setForm] = useState({
        name: '', address: '', time: '', contact: '', bloodTypes: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentCampId, setCurrentCampId] = useState(null);

    // --- NEW STATES FOR DELETE MODAL ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [campToDeleteId, setCampToDeleteId] = useState(null);

    const API_URL = 'https://blood-connect-orcin.vercel.app/api/blood-camps';

    useEffect(() => {
        if (isPasswordVerified) {
            fetchCamps();
        }
    }, [isPasswordVerified]);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === CORRECT_PASSWORD) {
            setIsPasswordVerified(true);
            setPasswordError('');
        } else {
            setPasswordError('Incorrect password. Please try again.');
        }
    };

    const fetchCamps = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setCamps(data);
        } catch (error) {
            console.error("Failed to fetch camps:", error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({ name: '', address: '', time: '', contact: '', bloodTypes: '' });
        setIsEditing(false);
        setCurrentCampId(null);
    };
    
    const handleEdit = (camp) => {
        setIsEditing(true);
        setCurrentCampId(camp._id);
        setForm({
            name: camp.name, address: camp.address, time: camp.time,
            contact: camp.contact, bloodTypes: camp.bloodTypes
        });
        window.scrollTo(0, 0);
    };

    // --- MODIFIED DELETE PROCESS ---

    // Step 1: Open the modal and set the camp ID to delete
    const handleDelete = (id) => {
        setCampToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    // Step 2: Perform the deletion if confirmed from the modal
    const confirmDelete = async () => {
        if (campToDeleteId) {
            try {
                await fetch(`${API_URL}/${campToDeleteId}`, { method: 'DELETE' });
                fetchCamps(); // Refresh the list
            } catch (error) {
                console.error("Error deleting camp:", error);
            } finally {
                // Close the modal and reset the ID
                setIsDeleteModalOpen(false);
                setCampToDeleteId(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/${currentCampId}` : API_URL;
        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            fetchCamps();
            resetForm();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    // --- CONDITIONAL RENDERING ---

    if (!isPasswordVerified) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center mb-6">Admin Access Required</h2>
                    <form onSubmit={handlePasswordSubmit}>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Password</label>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="mt-1 w-full p-2 border rounded-md focus:ring-red-500 focus:border-red-500"
                                placeholder="Enter password"
                            />
                        </div>
                        {passwordError && (
                            <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                        )}
                        <button type="submit" className="w-full bg-red-600 text-white font-semibold py-3 mt-6 rounded-md hover:bg-red-700">
                            Enter
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-gray-50 min-h-screen">
            {/* --- DELETE CONFIRMATION MODAL --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-lg font-bold">Confirm Deletion</h3>
                        <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete this camp?</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-xl mx-auto py-8 px-4">
                <header className="flex items-center justify-between mb-6">
                    <button className="text-xl font-bold">←</button>
                    <h1 className="text-xl font-semibold text-center flex-grow">Blood Camps</h1>
                </header>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    {/* Form content remains the same */}
                    <h2 className="text-lg font-bold mb-4">
                        {isEditing ? 'Edit Blood Camp' : 'Add New Blood Camp'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                         <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Blood Camp Name</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. City Blood Camp" className="mt-1 w-full p-2 border rounded-md focus:ring-red-500 focus:border-red-500"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Address</label>
                                <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="e.g. 123 Main St, Anytown" className="mt-1 w-full p-2 border rounded-md focus:ring-red-500 focus:border-red-500"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Time</label>
                                <input type="text" name="time" value={form.time} onChange={handleChange} placeholder="e.g. 9:00 AM - 5:00 PM" className="mt-1 w-full p-2 border rounded-md focus:ring-red-500 focus:border-red-500"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Contact Number</label>
                                <input type="text" name="contact" value={form.contact} onChange={handleChange} placeholder="e.g. (555) 123-4567" className="mt-1 w-full p-2 border rounded-md focus:ring-red-500 focus:border-red-500"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Available Blood Types</label>
                                <input type="text" name="bloodTypes" value={form.bloodTypes} onChange={handleChange} placeholder="e.g. O+, A-, B+" className="mt-1 w-full p-2 border rounded-md focus:ring-red-500 focus:border-red-500"/>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-6">
                            <button type="submit" className="flex-grow bg-red-600 text-white font-semibold py-3 rounded-md hover:bg-red-700">
                                {isEditing ? 'Update Camp' : 'Add Blood Camp'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={resetForm} className="flex-grow bg-gray-200 text-gray-800 font-semibold py-3 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-bold mb-4">Existing Blood Camps</h2>
                    <div className="space-y-3">
                        {camps.map(camp => (
                            <div key={camp._id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{camp.name}</h3>
                                    <p className="text-sm text-gray-600">{camp.address}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => handleEdit(camp)} className="p-2 text-gray-500 hover:text-blue-600">✏️</button>
                                    <button onClick={() => handleDelete(camp._id)} className="p-2 text-gray-500 hover:text-red-600">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodCampManager;
