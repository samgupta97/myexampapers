import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserHome from './pages/UserHome';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUploadPaper from './pages/AdminUploadPaper';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* User Portals */}
      <Route path="/home" element={<UserHome />} />

      {/* Admin Portals */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/home" element={<AdminDashboard />} />
      <Route path="/admin/papers" element={<AdminDashboard />} />
      <Route path="/admin/upload-paper" element={<AdminUploadPaper />} />
      <Route path="/admin/users" element={<AdminUsers />} />
    </Routes>
  );
}

export default App;
