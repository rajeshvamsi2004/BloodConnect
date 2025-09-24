import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify'; 

const API_BASE_URL = 'https://bloodconnect-new.onrender.com'; 

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    Username: '',
    Email: '',
    Password: '',
    ConfirmPassword: '',
    OTP: '',
  });
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Get the login function from AuthContext

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'register') {
      setIsLogin(false);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.Email) {
      toast.error('Please enter your email to send OTP.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/send-email`, { email: formData.Email });
      toast.success(res.data.message);
      setShowOtpField(true);
      setOtpSent(true);
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.Email || !formData.OTP) {
      toast.error('Please enter email and OTP.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/verify-otp`, { email: formData.Email, otp: formData.OTP });
      toast.success(res.data.message);
      if (!isLogin) { 
        await handleRegister();
      } else { 
         toast.info("OTP verified, please proceed with login.");
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (formData.Password !== formData.ConfirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/register`, {
        Username: formData.Username,
        Email: formData.Email,
        Password: formData.Password,
      });
      toast.success(res.data);
      setIsLogin(true); 
      setShowOtpField(false); 
      setOtpSent(false);
      setFormData({ ...formData, OTP: '' }); 
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data || 'Registration Unsuccessful.');
    } finally {
      setIsLoading(false);
    }
  };

  
const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {
        Email: formData.Email,
        Password: formData.Password,
      });

      if (res.data === "Login Successful") {
        toast.success("Login Successful!");
        
        // --- THIS IS THE FIX ---
        // Use 'await' to ensure the context is updated before navigating.
        await login(formData.Email); 
        
        navigate('/dashboard/profile'); // Navigate AFTER the user is fully set in the context.
      } else {
        // This case might not be needed if your API sends error codes, but is safe to have
        toast.error(res.data);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data || 'Login Error.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      if (otpSent && showOtpField && formData.OTP) {
        handleVerifyOtp(); 
      } else if (otpSent && !showOtpField) { 
         setShowOtpField(true);
      } else {
        handleSendOtp(); 
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-6 py-3 text-lg font-semibold rounded-t-lg transition-all duration-300 ${
              isLogin ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-6 py-3 text-lg font-semibold rounded-t-lg transition-all duration-300 ${
              !isLogin ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Register
          </button>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {isLogin ? 'Welcome Back!' : 'Join BloodConnect'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="Username" className="block text-gray-700 text-sm font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="Username"
                name="Username"
                value={formData.Username}
                onChange={handleChange}
                required={!isLogin}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label htmlFor="Email" className="block text-gray-700 text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="Email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="Password" className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="Password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
              placeholder="••••••••"
            />
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="ConfirmPassword" className="block text-gray-700 text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="ConfirmPassword"
                name="ConfirmPassword"
                value={formData.ConfirmPassword}
                onChange={handleChange}
                required={!isLogin}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                placeholder="••••••••"
              />
            </div>
          )}

          {!isLogin && (
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading || otpSent}
                className={`flex-grow px-4 py-3 rounded-lg font-bold transition duration-300 ${
                  isLoading || otpSent
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isLoading ? 'Sending...' : otpSent ? 'OTP Sent!' : 'Send OTP'}
              </button>
              {otpSent && !showOtpField && (
                <button
                    type="button"
                    onClick={() => setShowOtpField(true)}
                    className="flex-grow px-4 py-3 rounded-lg font-bold bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
                >
                    Enter OTP
                </button>
            )}
            </div>
          )}

          {showOtpField && !isLogin && (
            <div>
              <label htmlFor="OTP" className="block text-gray-700 text-sm font-semibold mb-2">
                Enter OTP
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="OTP"
                  name="OTP"
                  value={formData.OTP}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                  placeholder="6-digit OTP"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-lg font-bold transition duration-300 ${
                    isLoading ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (!isLogin && (!formData.OTP || !otpSent))}
            className={`w-full px-4 py-3 rounded-lg font-bold text-lg transition duration-300 ${
              isLoading || (!isLogin && (!formData.OTP || !otpSent))
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
