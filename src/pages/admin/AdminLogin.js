import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { account } from '../../appwrite/config';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await account.get();
      // Already logged in, redirect to dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      // Not logged in, stay on login page
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    console.log('Attempting login...');
    
    // Try new method first, fallback to old method
    let session;
    try {
      session = await account.createEmailPasswordSession(email, password);
    } catch (err) {
      // Fallback to old method name
      if (err.message && err.message.includes('is not a function')) {
        session = await account.createEmailSession(email, password);
      } else {
        throw err;
      }
    }
    
    console.log('Login successful!');
    navigate('/admin/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    setError('Invalid email or password. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-header">
          <span className="login-icon">🔐</span>
          <h1 className="login-title">Admin Login</h1>
          <p className="login-subtitle">Access your dashboard</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/" className="back-link">
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
