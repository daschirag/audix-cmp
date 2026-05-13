import { createBrowserRouter } from 'react-router-dom'
import LoginScreen from '../screens/LoginScreen'
import DashboardScreen from '../screens/DashboardScreen'
import ComplaintsScreen from '../screens/ComplaintsScreen'
import RegulatorScreen from '../screens/RegulatorScreen'
import AuditScreen from '../screens/AuditScreen'
import AdminScreen from '../screens/AdminScreen'

export const router = createBrowserRouter([
  { path: '/', element: <LoginScreen /> },
  { path: '/dashboard', element: <DashboardScreen /> },
  { path: '/complaints', element: <ComplaintsScreen /> },
  { path: '/regulator', element: <RegulatorScreen /> },
  { path: '/audit', element: <AuditScreen /> },
  { path: '/admin', element: <AdminScreen /> },
])
