import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';
import { FiMail, FiLock } from 'react-icons/fi';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      loginUser(res.data.token, res.data.admin);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-login-container">
      {/* Background Top Wave */}
      <div className="new-login-curve">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#1a2b8a" fillOpacity="1" d="M0,64L48,80C96,96,192,128,288,144C384,160,480,160,576,144C672,128,768,96,864,80C960,64,1056,64,1152,80C1248,96,1344,128,1392,144L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <div className="new-login-content">
        {/* Left Area: Logo & Illustration */}
        <div className="new-login-left">
          <div className="new-login-logo" style={{ marginBottom: 'auto', marginTop: '50px' }}>
            <img src="/vaiso-logo-rebg.svg" alt="Vaiso Verse Logo" style={{ height: '100px', width: '150px', objectFit: 'contain' }} />
          </div>

          <div className="new-login-illustration">
            <img src="/login-illustration.png" alt="Team Collaboration" />
          </div>
        </div>

        {/* Right Area: Login Card */}
        <div className="new-login-right">
          <div className="new-login-card">
            <h2>Welcome Back!</h2>
            <p>Please sign in to your account</p>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="new-form-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="new-input-wrapper">
                  <FiMail className="new-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="admin@veeragroup.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="new-form-group">
                <label htmlFor="login-password">Password</label>
                <div className="new-input-wrapper">
                  <FiLock className="new-input-icon" />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="new-login-actions">
                <label className="remember-me">
                  <input type="checkbox" /> Remember Me
                </label>
                <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); setError('Please contact your IT administrator to reset your password.'); }}>Forgot Password?</a>
              </div>

              <button type="submit" className="new-btn-login" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
