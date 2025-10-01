// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Context ---
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Page & Layout Components ---
import LandingPage from './pages/LandingPage';
import LoginRegister from './components/Auth/LoginRegister';
import Dashboard from './pages/Dashboard'; // This is the layout for the protected area

// --- Dashboard Page Components ---
import Profile from './components/Dashboard/Profile';
import DonorsList from './components/Dashboard/DonorsList';
import IncomingRequests from './components/Dashboard/IncomingRequests';
import AcceptedRequests from './components/Dashboard/AcceptedRequests';
import RejectedRequests from './components/Dashboard/RejectedRequests';
import MyRequests from './components/Dashboard/MyRequests';
import DonorRegistrationForm from './components/Dashboard/DonorRegistrationForm';
import BloodRequestForm from './components/Dashboard/BloodRequestForm';
import MapComponent from './MapComponent';
import Blood from './Blood';
import BloodCampManager from './components/Dashboard/BloodCampManager';
import BloodCampList from './components/Dashboard/BloodCampList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- Public Routes (Have no special layout) --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthWrapper />} />

          {/* --- Protected Dashboard Routes --- */}
          {/* The <Dashboard> component contains its own Sidebar and Header (navbar) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="register-donor" element={<DonorRegistrationForm />} />
            <Route path="make-request" element={<BloodRequestForm />} />
            <Route path="donors-list" element={<DonorsList />} />
            <Route path="incoming-requests" element={<IncomingRequests />} />
            <Route path="my-requests" element={<MyRequests />} />
            <Route path="accepted" element={<AcceptedRequests />} />
            <Route path="rejected" element={<RejectedRequests />} />
            <Route path="map" element={<MapComponent/>}/>
            <Route path="blood" element={<Blood/>}/>
            <Route path="camps" element={<BloodCampManager/>}/>
            <Route path="camplist" element={<BloodCampList/>}/>
          </Route>

          {/* --- Fallback Route --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// --- Helper components (No changes needed) ---

function AuthWrapper() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard/profile" replace /> : <LoginRegister />;
}

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-red-600">Loading...</div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

export default App;
