import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, PROJECTS_COLLECTION_ID } from '../appwrite/config';
import './ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await databases.getDocument(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        id
      );
      
      console.log('Fetched project:', response);
      setProject(response);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Project not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Project Not Found</h2>
          <p>{error || 'The project you\'re looking for doesn\'t exist.'}</p>
          <button onClick={() => navigate('/portfolio')} className="back-btn">
            ← Back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      {/* Hero Section */}
      <section className="project-hero">
        <div className="container">
          <button onClick={() => navigate('/portfolio')} className="back-button">
            ← Back to Portfolio
          </button>
          
          <div className="project-header">
            <span className="project-category-badge">{project.category}</span>
            <h1 className="project-title">{project.title}</h1>
            <p className="project-subtitle">{project.description}</p>
          </div>

          {project.imageUrl && (
            <div className="project-hero-image">
              <img src={project.imageUrl} alt={project.title} />
            </div>
          )}
        </div>
      </section>

      {/* Project Content */}
      <section className="project-content section">
        <div className="container">
          <div className="content-grid">
            {/* Main Content */}
            <div className="main-content">
              <h2>Project Overview</h2>
              <div className="project-details">
                {project.details.split('\n').map((paragraph, index) => (
                  paragraph.trim() && <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="project-sidebar">
              {/* Technologies */}
              <div className="sidebar-card">
                <h3>🛠️ Technologies</h3>
                <div className="tech-tags">
                  {project.tags && project.tags.map((tag, index) => (
                    <span key={index} className="tech-tag">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="sidebar-card">
                <h3>📂 Category</h3>
                <p className="category-name">{project.category}</p>
              </div>

              {/* Date */}
              <div className="sidebar-card">
                <h3>📅 Created</h3>
                <p>{new Date(project.$createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>

              {/* Share/Actions */}
              <div className="sidebar-card">
                <h3>🔗 Share</h3>
                <div className="share-buttons">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }}
                    className="share-btn"
                  >
                    📋 Copy Link
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProjectDetail;
