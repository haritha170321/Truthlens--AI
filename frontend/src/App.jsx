import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts & Nav
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import BottomNav from './components/common/BottomNav';
import Footer from './components/common/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CheckNewsPage from './pages/CheckNewsPage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import HistoryPage from './pages/HistoryPage';
import SavedArticlesPage from './pages/SavedArticlesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ModelInfoPage from './pages/ModelInfoPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component (Allows demo access if guest user is in local storage)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  // If user is authenticated or demo mode is active
  if (!isAuthenticated && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#060d1f] text-slate-900 dark:text-slate-100 transition-colors duration-200">
              {/* Global Navbar with TruthLens AI Branding & Language Switcher */}
              <Navbar />

              {/* Main Content Area with Optional Sidebar for Dashboard Views */}
              <div className="flex-1 flex w-full">
                <Sidebar />
                <main className="flex-1 w-full min-w-0 overflow-x-hidden">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/models" element={<ModelInfoPage />} />
                    <Route path="/methodology" element={<ModelInfoPage />} />
                    
                    {/* Authenticated / Demo Workspace Suite Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/check" element={<CheckNewsPage />} />
                    <Route path="/result/:id" element={<AnalysisResultPage />} />
                    <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                    <Route path="/saved" element={<ProtectedRoute><SavedArticlesPage /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                    
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
              </div>

              {/* Global Footer */}
              <Footer />

              {/* Mobile Bottom Navigation Bar */}
              <BottomNav />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
