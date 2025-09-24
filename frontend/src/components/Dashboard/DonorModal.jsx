import React from 'react';

// The modal's only job is to display the information it is given.
// It receives the specific 'donor' object to display.
const DonorModal = ({ donor, isLoading, onClose }) => {
    return (
        // The semi-transparent background overlay
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            
            {/* The modal content box */}
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative transform transition-all duration-300 scale-100">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl font-light"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                
                <h3 className="text-2xl font-bold text-green-700 mb-6 text-center">
                    Donor Details
                </h3>
                
                {/* Conditional Content: Loading, Donor Found, or Not Found */}
                {isLoading ? (
                    <div className="text-center text-gray-600 p-4">
                        <p>Loading details...</p>
                    </div>
                ) : donor ? (
                    <div className="space-y-3 p-4 border rounded-lg bg-gray-50 text-center">
                        <p className="text-2xl font-semibold text-gray-800">
                            {donor.Name}
                        </p>
                        <p className="text-md text-gray-600">
                            Blood Group: <span className="font-bold text-red-600 text-lg">{donor.Blood}</span>
                        </p>
                        
                        <hr className="my-4" />
                        
                        <div>
                            <p className="text-sm text-gray-500">Contact Information</p>
                            <p className="text-md text-gray-800 mt-1">
                                {donor.Email}
                            </p>
                            <p className="text-md text-gray-800">
                                {donor.PhoneNumber}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-10">
                        The donor's details could not be found for this request.
                    </p>
                )}
            </div>
        </div>
    );
};

export default DonorModal;
