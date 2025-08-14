import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components aur Pages import karein
import Authpage from "./pages/Authpage";
import Home from "./pages/Home";
import Meeting from "./pages/Meeting";
import GuestMeeting from "./pages/GuestMeeting";
import Dashboard from "./pages/Dashboard";
import Test from "./pages/Test";
import ProtectedRoute from "./components/ProtectedRoute";

import './index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Authpage />} />

        {/* Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/meeting" 
          element={
            <ProtectedRoute>
              <Meeting />
            </ProtectedRoute>
          } 
        />
        
        {/* Guest accessible meeting route (no auth) */}
        <Route path="/guest/:meetingId" element={<GuestMeeting />} />

        {/* Auth-protected meeting route */}
        <Route 
          path="/meeting/:meetingId" 
          element={
            <ProtectedRoute>
              <Meeting />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin" fallbackTo="/home">
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/test" 
          element={
            <ProtectedRoute>
              <Test />
            </ProtectedRoute>
          } 
        />
        
        {/* Yeh route aap hata sakte hain agar /home pehle se hai */}
        <Route 
          path="/h" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
           
        />
      </Routes>
    </Router>
  );
};

export default App;