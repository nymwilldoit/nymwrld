import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { databases, DATABASE_ID, PROJECTS_COLLECTION_ID } from '../appwrite/config';
import { Query } from 'appwrite';
import './Portfolio.css';

function Portfolio() {
  const [filter, setFilter] = useState('All');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProjects();
  }, []);

  // Fetch projects from Appwrite
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]
      );
      
      console.log('Fetched projects:', response.documents);
      setProjects(response.documents);
      setFilteredProjects(response.documents);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter projects by category
  useEffect(() => {
    if (filter === 'All') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(p => p.category === filter);
      setFilteredProjects(filtered);
    }
  }, [filter, projects]);

  // Get unique categories
  const categories = ['All', ...new Set(projects.map(p => p.category))];

  // Loading state
  if (loading) {
    return (
      <div className="portfolio-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading amazing projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="portfolio-page">
        <section className="page-header">
          <div className="container">
            <h1 className="page-title">Our Portfolio</h1>
          </div>
        </section>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchProjects} className="retry-btn">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Our Portfolio</h1>
          <p className="page-subtitle">
            Showcasing our innovative environmental and AI projects
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="portfolio-filter section">
        <div className="container">
          <div className="filter-buttons">
            {categories.map((cat, index) => (
              <button
                key={index}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="portfolio-grid-section section">
        <div className="container">
          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No projects found</h3>
              <p>
                {filter === 'All' 
                  ? 'No projects available yet. Check back soon!' 
                  : `No projects in "${filter}" category yet.`}
              </p>
              {filter !== 'All' && (
                <button onClick={() => setFilter('All')} className="show-all-btn">
                  Show All Projects
                </button>
              )}
            </div>
          ) : (
            <div className="portfolio-grid">
              {filteredProjects.map((project, index) => (
                <Link 
                  key={project.$id} 
                  to={`/project/${project.$id}`}
                  className="portfolio-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {project.imageUrl && (
                    <div className="portfolio-image">
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        }}
                      />
                      <div className="image-overlay">
                        <span className="view-details">View Details →</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="portfolio-card-header">
                    <span className="portfolio-category">{project.category}</span>
                  </div>
                  
                  <div className="portfolio-card-body">
                    <h3 className="portfolio-title">{project.title}</h3>
                    <p className="portfolio-description">
                      {project.description}
                    </p>
                    
                    <div className="portfolio-tags">
                      {project.tags && project.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                      {project.tags && project.tags.length > 3 && (
                        <span className="tag">+{project.tags.length - 3}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="portfolio-card-footer">
                    <span className="portfolio-link">
                      Learn More <span className="arrow">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Portfolio;
