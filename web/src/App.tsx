import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AdminPage } from '@/pages/AdminPage';
import { HomePage } from '@/pages/HomePage';
import { initializeStorage } from '@/lib/storage-init';

function App() {
  useEffect(() => {
    // Initialize Supabase storage on app startup
    initializeStorage();
  }, []);

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
