import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";

// Components aur Pages import karein
import Authpage from "./pages/Authpage";
import Home from "./pages/Home";
import Meeting from "./pages/Meeting";
import GuestMeeting from "./pages/GuestMeeting";
import Dashboard from "./pages/Dashboard";
import AdminUsers from "./pages/AdminUsers";
import Test from "./pages/Test";
import ProtectedRoute from "./components/ProtectedRoute";

import "./index.css";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Authpage />} />

        {/* Protected Routes */}
        <Route element={<AppLayout />}>
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

          {/* Meeting route protected by guest-aware guard. Guests are redirected to /guest/:id to enter name. */}
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
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin" fallbackTo="/home">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
         
          <Route path="/calendar" element={<ProtectedRoute> <Test /> </ProtectedRoute>}/>
          <Route path="/admin/security" element={<ProtectedRoute> <Test /> </ProtectedRoute>}/>
          <Route path="/admin/customization" element={<ProtectedRoute> <Test /> </ProtectedRoute>}/>
          <Route path="/admin/status" element={<ProtectedRoute> <Test /> </ProtectedRoute>}/>
          <Route path="/notifications" element={<ProtectedRoute> <Test /> </ProtectedRoute>}/>
          <Route path="/docs" element={<ProtectedRoute> <Test /> </ProtectedRoute>}/>
        </Route>



        {/* Yeh route aap hata sakte hain agar /home pehle se hai */}
        <Route
          path="/h"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
