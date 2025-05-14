// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import WorkPolicyForm from './components/WorkPolicyForm';
import TimeEvents from './components/TImeEvent';
import ShiftCreation from './components/ShiftCreation';
import ShiftAssignement from './components/ShiftAssignment';
import Header from './components/Header';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected route wrapper component
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { currentUser, appUser } = useAuth();
  
  if (!currentUser || !appUser) {
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
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}