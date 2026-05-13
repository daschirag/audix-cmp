import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import ConsentForm from './pages/ConsentForm';
import Dashboard from './pages/Dashboard';

function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/auth" replace />;
}

function App() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/consent-form" element={<ConsentForm />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            isLoggedIn
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/auth" replace />
          }
        />
        {/* Catch-all: go to consent-form, NOT auth */}
        <Route path="*" element={<Navigate to="/consent-form" replace />} />
      </Routes>
    </Router>
  );
}

export default App;