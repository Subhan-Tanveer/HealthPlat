import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, BrowserRouter as Router } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Import Firebase authentication functions and auth instance
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './pages/firebase-config'; // FIX: Corrected path

// Import your page components
import LoginPage from '@/pages/LoginPage';
import SignUpPage from './pages/SignUp'; // Correctly import SignUpPage from components
import DashboardLayout from '@/layouts/DashboardLayout';
import Dashboard from '@/pages/Dashboard'; // Assuming this is your main dashboard content
import BookDoctor from '@/pages/BookDoctor';
import OnlineConsultations from '@/pages/OnlineConsultations';
import LabTests from '@/pages/LabTests';
import HealthForum from '@/pages/HealthForum.jsx';
import Blog from '@/pages/Blog.jsx';
import Directory from '@/pages/Directory.jsx';
import Offers from '@/pages/Offers.jsx';
import AiTools from '@/pages/AiTools';
import Profile from '@/pages/Profile.jsx';

function App() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null); // State to hold current authenticated user
  const [loadingAuth, setLoadingAuth] = useState(true); // State to track auth loading

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });

    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      // The onAuthStateChanged listener in DashboardLayout (or App) will handle navigation to /login
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Show a loading indicator while Firebase Auth is initializing
  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-700">
        Loading authentication...
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        {/* If user is logged in, redirect from login/signup to dashboard */}
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/signup" element={currentUser ? <Navigate to="/dashboard" /> : <SignUpPage />} /> 
        
        {/* Default route: if authenticated, go to dashboard; otherwise, go to login */}
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

        {/* Protected Routes - Each wrapped by DashboardLayout if authenticated */}
        {currentUser ? (
          <>
            {/* Dashboard Home */}
            <Route path="/dashboard" element={<DashboardLayout onLogout={handleLogout}><Dashboard /></DashboardLayout>} />
            
            {/* Specific Protected Pages */}
            <Route path="/book-doctor" element={<DashboardLayout onLogout={handleLogout}><BookDoctor /></DashboardLayout>} />
            <Route path="/online-consultations" element={<DashboardLayout onLogout={handleLogout}><OnlineConsultations /></DashboardLayout>} />
            <Route path="/lab-tests" element={<DashboardLayout onLogout={handleLogout}><LabTests /></DashboardLayout>} />
            {/* <Route path="/medicine-delivery" element={<DashboardLayout onLogout={handleLogout}><MedicineDelivery /></DashboardLayout>} /> */}
            {/* <Route path="/call-doctor-now" element={<DashboardLayout onLogout={handleLogout}><CallDoctorNow /></DashboardLayout>} /> */}
            <Route path="/health-forum" element={<DashboardLayout onLogout={handleLogout}><HealthForum /></DashboardLayout>} />
            <Route path="/blog" element={<DashboardLayout onLogout={handleLogout}><Blog /></DashboardLayout>} />
            <Route path="/directory" element={<DashboardLayout onLogout={handleLogout}><Directory /></DashboardLayout>} />
            <Route path="/offers" element={<DashboardLayout onLogout={handleLogout}><Offers /></DashboardLayout>} />
            <Route path="/ai-tools" element={<DashboardLayout onLogout={handleLogout}><AiTools /></DashboardLayout>} />
            <Route path="/profile" element={<DashboardLayout onLogout={handleLogout}><Profile /></DashboardLayout>} />
          </>
        ) : (
          // If not authenticated, any other path redirects to login
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </AnimatePresence>
  );
}

export default App;
