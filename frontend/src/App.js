import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import BookRoom from './pages/BookRoom';
import MyBookings from './pages/MyBookings';
import Complaints from './pages/Complaints';
import AdminDashboard from './pages/admin/AdminDashboard';
import QRScanner from './pages/admin/QRScanner';
import ManageRooms from './pages/admin/ManageRooms';
import ManageBookings from './pages/admin/ManageBookings';
import RedList from './pages/admin/RedList';
import AdminComplaints from './pages/admin/AdminComplaints';
import Analytics from './pages/admin/Analytics';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/book" element={<PrivateRoute><BookRoom /></PrivateRoute>} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/complaints" element={<PrivateRoute><Complaints /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/scanner" element={<PrivateRoute adminOnly><QRScanner /></PrivateRoute>} />
        <Route path="/admin/rooms" element={<PrivateRoute adminOnly><ManageRooms /></PrivateRoute>} />
        <Route path="/admin/bookings" element={<PrivateRoute adminOnly><ManageBookings /></PrivateRoute>} />
        <Route path="/admin/redlist" element={<PrivateRoute adminOnly><RedList /></PrivateRoute>} />
        <Route path="/admin/complaints" element={<PrivateRoute adminOnly><AdminComplaints /></PrivateRoute>} />
        <Route path="/admin/analytics" element={<PrivateRoute adminOnly><Analytics /></PrivateRoute>} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
