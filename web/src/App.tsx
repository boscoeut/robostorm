import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminPage } from '@/pages/AdminPage';
import { RobotDatabasePage } from '@/pages/RobotDatabasePage';
import { IndustryNewsPage } from '@/pages/IndustryNewsPage';
import LandingPage from '@/components/LandingPage';

// Placeholder page components - these will be replaced with actual implementations
const HomePage = () => <LandingPage />;


function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/robots" element={<RobotDatabasePage />} />
              <Route path="/news" element={<IndustryNewsPage />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
