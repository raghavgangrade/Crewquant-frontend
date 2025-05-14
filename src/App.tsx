import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import WorkPolicyForm from './components/WorkPolicyForm';
import TimeEvents from './components/TImeEvent';
import ShiftCreation from './components/ShiftCreation';
import ShiftAssignement from './components/ShiftAssignment';
import Header from './components/Header';

// Protected route wrapper component
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      <Header />
      {element}
    </>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    
    // Check on component mount
    checkAuth();
    
    // Add event listener for storage changes (for when token is removed in another tab)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Protected routes (require authentication) */}
        <Route path="/work-policy" element={<ProtectedRoute element={<WorkPolicyForm />} />} />
        <Route path="/time-events" element={<ProtectedRoute element={<TimeEvents />} />} />
        <Route path="/shift-creation" element={<ProtectedRoute element={<ShiftCreation />} />} />
        <Route path="/shift-assignment" element={<ProtectedRoute element={<ShiftAssignement />} />} />
        
        {/* Redirect to login if no route matches */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
