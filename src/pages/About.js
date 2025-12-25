import React, { useEffect, useState } from 'react';
import { databases, DATABASE_ID, ABOUT_COLLECTION_ID } from '../appwrite/config';
import { Query } from 'appwrite';
import './About.css';

function About() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        ABOUT_COLLECTION_ID,
        [Query.limit(1)]
      );

      if (response.documents.length > 0) {
        setAboutData(response.documents[0]);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="about-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Default data if nothing in database
  const data = aboutData || {
    name: 'Your Name',
    status: 'Student',
    bio: 'Add your bio in the admin panel.',
    currentProject: 'Your current project',
    email: 'your.email@example.com',
    location: 'Your location',
    github: '',
    linkedin: '',
    facebook: '',
    twitter: '',
    profileImage: '',
    skills: ['Python', 'React', 'Machine Learning'],
    education: 'Your education details',
    experience: 'Your experience details'
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">About Me</h1>
              <p className="hero-status">{data.status}</p>
              <p className="hero-subtitle">
                {data.bio.substring(0, 150)}...
              </p>
            </div>
            {data.profileImage && (
              <div className="hero-image">
                <img src={data.profileImage} alt={data.name} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="about-content section">
        <div className="container">
          <div className="content-grid">
            {/* Bio Section */}
            <div className="content-card">
              <h2 className="card-title">👋 Hello, I'm {data.name}</h2>
              <p className="card-text">{data.bio}</p>

              {data.currentProject && (
                <div className="current-project">
                  <h3>🚀 Currently Working On</h3>
                  <p>{data.currentProject}</p>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="content-card">
              <h2 className="card-title">📫 Contact Information</h2>
              <div className="contact-list">
                {data.email && (
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <a href={`mailto:${data.email}`}>{data.email}</a>
                  </div>
                )}
                {data.phone && (
                  <div className="contact-item">
                    <span className="contact-icon">📱</span>
                    <a href={`tel:${data.phone}`}>{data.phone}</a>
                  </div>
                )}
                {data.location && (
                  <div className="contact-item">
                    <span className="contact-icon">📍</span>
                    <span>{data.location}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="social-links">
                {data.github && (
                  <a href={data.github} target="_blank" rel="noopener noreferrer" className="social-link">
                    <span>💻</span> GitHub
                  </a>
                )}
                {data.linkedin && (
                  <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                    <span>💼</span> LinkedIn
                  </a>
                )}
                {data.facebook && (
                  <a href={data.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                    <span>📘</span> Facebook
                  </a>
                )}
                {data.twitter && (
                  <a href={data.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                    <span>🐦</span> Twitter
                  </a>
                )}
              </div>
            </div>

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div className="content-card">
                <h2 className="card-title">💡 Skills</h2>
                <div className="skills-grid">
                  {data.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {data.education && (
              <div className="content-card">
                <h2 className="card-title">🎓 Education</h2>
                <p className="card-text">{data.education}</p>
              </div>
            )}

            {/* Experience */}
            {data.experience && (
              <div className="content-card">
                <h2 className="card-title">💼 Experience</h2>
                <p className="card-text">{data.experience}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
