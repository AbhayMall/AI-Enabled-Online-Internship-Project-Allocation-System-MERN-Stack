import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ProfilePage from './pages/student/ProfilePage';
import BrowseOpportunities from './pages/student/BrowseOpportunities';
import RecommendedOpportunities from './pages/student/RecommendedOpportunities';
import MyApplications from './pages/student/MyApplications';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import PostOpportunity from './pages/faculty/PostOpportunity';
import ManagePostings from './pages/faculty/ManagePostings';
import ReviewApplications from './pages/faculty/ReviewApplications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import UserManagement from './pages/admin/UserManagement';

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {!isAuthPage && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Landing & Authentication Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/browse"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <BrowseOpportunities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/recommendations"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <RecommendedOpportunities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          {/* Faculty Protected Routes */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/post"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <PostOpportunity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/manage"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <ManagePostings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/review"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <ReviewApplications />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
