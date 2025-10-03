// src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-3xl font-bold">BloodConnect</span>
          </div>
          <div>
            <Link to="/auth" className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-300">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-700 to-red-900 text-white py-20 md:py-32 flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-down">
            Give the Gift of Life
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fade-in-up">
            Connect with donors and recipients seamlessly. Register, request, and manage blood donations with ease.
          </p>
          <Link to="/auth?action=register" className="px-8 py-4 bg-white text-red-600 font-bold rounded-full text-lg hover:bg-gray-100 transition duration-300 shadow-lg animate-bounce-slow">
            Register as Donor Today!
          </Link>
        </div>
        {/* Abstract Blood Drop Graphic */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 opacity-20 hidden md:block">
          <svg className="w-64 h-64" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100,0 C150,0 180,60 180,100 C180,160 100,200 100,200 C100,200 20,160 20,100 C20,60 50,0 100,0 Z" />
          </svg>
        </div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-20 hidden md:block">
          <svg className="w-48 h-48" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100,0 C150,0 180,60 180,100 C180,160 100,200 100,200 C100,200 20,160 20,100 C20,60 50,0 100,0 Z" />
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition duration-300 ease-in-out">
              <div className="text-red-600 text-5xl mb-6">
                <i className="fas fa-user-plus"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Register as a Donor</h3>
              <p className="text-gray-600">Create your profile and become a registered blood donor in minutes.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition duration-300 ease-in-out">
              <div className="text-red-600 text-5xl mb-6">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Request Blood</h3>
              <p className="text-gray-600">Submit a blood request with details and connect with potential donors.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition duration-300 ease-in-out">
              <div className="text-red-600 text-5xl mb-6">
                <i className="fas fa-hand-holding-heart"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Save Lives</h3>
              <p className="text-gray-600">Your donation can make a life-saving difference for those in need.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-red-800 text-white py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
        <p className="text-lg mb-8 max-w-xl mx-auto">
          Join our community of compassionate donors and help save lives. Every drop counts.
        </p>
        <Link to="/auth?action=register" className="px-8 py-4 bg-white text-red-800 font-bold rounded-full text-lg hover:bg-gray-100 transition duration-300 shadow-lg">
          Join BloodConnect
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} BloodConnect. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition duration-300"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300"><i className="fab fa-twitter"></i></a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;