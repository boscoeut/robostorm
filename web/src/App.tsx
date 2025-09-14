import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AdminPage } from '@/pages/AdminPage';
import { HomePage } from '@/pages/HomePage';

// Placeholder components - these would need to be implemented
const ThemeProvider = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const AuthProvider = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const AppLayout = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const ProtectedRoute = ({ children }: { children: React.ReactNode; requireAdmin?: boolean }) => <div>{children}</div>;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />

              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              
            </Routes>
          </AppLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
