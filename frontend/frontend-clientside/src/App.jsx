import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/auth';
import ConsentForm from './pages/ConsentForm';
import Dashboard from './pages/Dashboard';

function PrivateRoute({ children }) {
  const token = sessionStorage.getItem('accessToken')
  return token ? children : <Navigate to="/auth" replace />
}

function App() {
  const token = sessionStorage.getItem('accessToken')
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/consent-form" element={<ConsentForm />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/" element={
          token ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
        } />
        <Route path="*" element={<Navigate to="/consent-form" replace />} />
      </Routes>
    </Router>
  )
}

export default App