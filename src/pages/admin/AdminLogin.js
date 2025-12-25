import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../../appwrite/config';
import './AdminLogin.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      await account.get();
      // User is logged in, redirect to dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      // User not logged in, stay on login page
      console.log('No active session');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create email session in Appwrite
      await account.createEmailPasswordSession(email, password);
      
      console.log('Login successful!');
      
      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      // User-friendly error messages
      if (err.code === 401) {
        setError('Invalid email or password');
      } else if (err.message.includes('user')) {
        setError('No account found with this email');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="login-header">
          <div className="logo">🌿</div>
          <h2>Admin Portal</h2>
          <p>EcoML Studio Dashboard</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ecomlstudio.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <>
                <span className="spinner">⏳</span>
                Logging in...
              </>
            ) : (
              <>
                <span className="button-icon">🚀</span>
                Login to Dashboard
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>🔐 Secure admin access only</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
