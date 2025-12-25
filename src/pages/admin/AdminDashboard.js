import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { account, databases, DATABASE_ID, PROJECTS_COLLECTION_ID, MESSAGES_COLLECTION_ID } from '../../appwrite/config';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    projects: 0,
    messages: 0,
    views: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      console.error('Not authenticated:', error);
      navigate('/admin/login');
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get projects count
      const projectsResponse = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID
      );

      // Get messages count
      let messagesCount = 0;
      try {
        const messagesResponse = await databases.listDocuments(
          DATABASE_ID,
          MESSAGES_COLLECTION_ID
        );
        messagesCount = messagesResponse.total;
      } catch (err) {
        console.log('Messages collection not yet created');
      }

      setStats({
        projects: projectsResponse.total,
        messages: messagesCount,
        views: Math.floor(Math.random() * 1000) + 500 // Placeholder
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <section className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title-section">
            <h1>Admin Dashboard</h1>
            <p className="admin-subtitle">
              Welcome back, {user?.name || 'Admin'}
            </p>
          </div>
          <div className="admin-actions">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <span className="stat-icon">📂</span>
            <h2 className="stat-number">{stats.projects}</h2>
            <p className="stat-label">Total Projects</p>
          </div>

          <div className="stat-card">
            <span className="stat-icon">✉️</span>
            <h2 className="stat-number">{stats.messages}</h2>
            <p className="stat-label">New Messages</p>
          </div>

          <div className="stat-card">
            <span className="stat-icon">👁️</span>
            <h2 className="stat-number">{stats.views}</h2>
            <p className="stat-label">Total Views</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/projects" className="action-card">
              <span className="action-icon">📁</span>
              <h3 className="action-title">Manage Projects</h3>
              <p className="action-description">
                Add, edit, or delete portfolio projects
              </p>
            </Link>

            <Link to="/admin/about" className="action-card">
              <span className="action-icon">👤</span>
              <h3 className="action-title">Manage About</h3>
              <p className="action-description">
                Update profile, bio, and social links
              </p>
            </Link>

            <Link to="/admin/messages" className="action-card">
              <span className="action-icon">💬</span>
              <h3 className="action-title">View Messages</h3>
              <p className="action-description">
                Read and respond to contact messages
              </p>
            </Link>

            <Link to="/" className="action-card">
              <span className="action-icon">🌐</span>
              <h3 className="action-title">View Website</h3>
              <p className="action-description">
                See your live portfolio website
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
