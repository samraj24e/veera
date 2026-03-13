import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Leave from './pages/Leave';
import { FiGrid, FiUsers, FiDollarSign, FiCalendar, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import './index.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  const { logoutUser, admin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-brand">
          <img src="/vaiso-logo-rebg.svg" alt="Vaiso Verse Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <nav className={`topbar-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <NavLink to="/dashboard" onClick={closeMenu}><FiGrid /> Dashboard</NavLink>
          <NavLink to="/employees" onClick={closeMenu}><FiUsers /> Employees</NavLink>
          <NavLink to="/payroll" onClick={closeMenu}><FiDollarSign /> Payroll</NavLink>
          <NavLink to="/leave" onClick={closeMenu}><FiCalendar /> Leave</NavLink>
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
