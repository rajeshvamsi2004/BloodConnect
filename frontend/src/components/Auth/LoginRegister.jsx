import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://bloodconnect-sev0.onrender.com';
const OTP_TIMEOUT = 25000; // 25 seconds timeout for the OTP request
const RESEND_OTP_COOLDOWN = 30; // 30 seconds cooldown for resend OTP

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
  // New state to provide more specific feedback to the user
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const otpTimeoutRef = useRef(null);
  const resendIntervalRef = useRef(null);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'register') {
      setIsLogin(false);
    }
  }, [location.search]);

  useEffect(() => {
    if (resendCooldown > 0) {
      resendIntervalRef.current = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(resendIntervalRef.current);
    }
    return () => clearInterval(resendIntervalRef.current);
  }, [resendCooldown]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.Email) {
      toast.error('Please enter your email to send OTP.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Waking up the server... this might take a moment.');

    // Set a timeout for the OTP request
    otpTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        toast.error("Server is taking too long to respond. Please try again.");
    }, OTP_TIMEOUT);


    try {
      const res = await axios.post(`${API_BASE_URL}/send-email`, { email: formData.Email });
      clearTimeout(otpTimeoutRef.current); // Clear the timeout on successful response
      toast.success(res.data.message);
      setShowOtpField(true);
      setOtpSent(true);
      setResendCooldown(RESEND_OTP_COOLDOWN); // Start the resend cooldown
    } catch (error) {
      clearTimeout(otpTimeoutRef.current);
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('Loading...');
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.Email || !formData.OTP) {
      toast.error('Please enter email and OTP.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Verifying OTP...');
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
      setLoadingMessage('Loading...');
    }
  };

  const handleRegister = async () => {
    if (formData.Password !== formData.ConfirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Registering...');
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
      setLoadingMessage('Loading...');
    }
  };


const handleLogin = async () => {
    setIsLoading(true);
    setLoadingMessage('Logging in...');
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {
        Email: formData.Email,
        Password: formData.Password,
      });

      if (res.data === "Login Successful") {
        toast.success("Login Successful!");
        await login(formData.Email);
        navigate('/dashboard/profile');
      } else {
        toast.error(res.data);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data || 'Login Error.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('Loading...');
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

        {/* Display loading message */}
        {isLoading && <p className="text-center text-gray-600 mb-4">{loadingMessage}</p>}


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
                {otpSent ? 'OTP Sent!' : 'Send OTP'}
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
               {/* Resend OTP button with cooldown */}
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0}
                  className={`text-sm font-medium ${resendCooldown > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-red-600 hover:underline'}`}
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
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
            {isLoading ? loadingMessage : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
