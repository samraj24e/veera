import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Leave from './pages/Leave';
import { FiGrid, FiUsers, FiDollarSign, FiCalendar, FiLogOut } from 'react-icons/fi';
import './index.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  const { logoutUser, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon">VG</div>
          <h2>Veera Group EMS</h2>
        </div>
        <nav className="topbar-nav">
          <NavLink to="/dashboard"><FiGrid /> Dashboard</NavLink>
          <NavLink to="/employees"><FiUsers /> Employees</NavLink>
          <NavLink to="/payroll"><FiDollarSign /> Payroll</NavLink>
          <NavLink to="/leave"><FiCalendar /> Leave</NavLink>
          <button onClick={handleLogout}><FiLogOut /> Logout</button>
        </nav>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/employees" element={
        <ProtectedRoute><AppLayout><Employees /></AppLayout></ProtectedRoute>
      } />
      <Route path="/payroll" element={
        <ProtectedRoute><AppLayout><Payroll /></AppLayout></ProtectedRoute>
      } />
      <Route path="/leave" element={
        <ProtectedRoute><AppLayout><Leave /></AppLayout></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
