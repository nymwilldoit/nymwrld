import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, databases, DATABASE_ID, PROJECTS_COLLECTION_ID } from '../../appwrite/config';
import { Query } from 'appwrite';
import './AdminDashboard.css';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    lastUpdate: 'Loading...'
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const userData = await account.get();
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('Not authenticated:', error);
      navigate('/admin/login');
    }
  };

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      // Get total projects count
      const response = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        [Query.limit(100)] // Adjust limit as needed
      );
      
      setStats({
        totalProjects: response.total,
        lastUpdate: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle logout
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
      <div className="loading-screen">
        <div className="loading-spinner">⏳</div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🌿 EcoML Studio</h1>
            <span className="header-subtitle">Admin Dashboard</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span className="user-name">{user?.email || 'Admin'}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="container">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h2>Welcome back! 👋</h2>
            <p>Manage your portfolio content from here</p>
          </section>

          {/* Stats Grid */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.totalProjects}</div>
                  <div className="stat-label">Total Projects</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🕐</div>
                <div className="stat-content">
                  <div className="stat-value">Recent</div>
                  <div className="stat-label">{stats.lastUpdate}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✨</div>
                <div className="stat-content">
                  <div className="stat-value">Active</div>
                  <div className="stat-label">Status: Online</div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Cards */}
          <section className="actions-section">
            <h3>Quick Actions</h3>
            <div className="action-cards">
              <div 
                className="action-card"
                onClick={() => navigate('/admin/projects')}
              >
                <div className="card-icon">📂</div>
                <h4>Manage Projects</h4>
                <p>Add, edit, or delete portfolio projects</p>
                <button className="card-button">
                  Go to Projects <span>→</span>
                </button>
              </div>

              <div 
                className="action-card"
                onClick={() => navigate('/admin/about')}
              >
                <div className="card-icon">👤</div>
                <h4>Edit About</h4>
                <p>Update about section content</p>
                <button className="card-button">
                  Edit About <span>→</span>
                </button>
              </div>

              <div 
                className="action-card"
                onClick={() => navigate('/admin/stats')}
              >
                <div className="card-icon">📊</div>
                <h4>Update Stats</h4>
                <p>Modify statistics and achievements</p>
                <button className="card-button">
                  Update Stats <span>→</span>
                </button>
              </div>

              <div 
                className="action-card"
                onClick={() => navigate('/')}
              >
                <div className="card-icon">🌐</div>
                <h4>View Website</h4>
                <p>See your live portfolio website</p>
                <button className="card-button">
                  Visit Site <span>→</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
