import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID, ABOUT_COLLECTION_ID, Query } from '../appwrite/config';
import './About.css';

const About = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        ABOUT_COLLECTION_ID,
        [Query.equal('isActive', true), Query.orderDesc('$createdAt')]
      );
      
      const sorted = response.documents.sort((a, b) => {
        if (a.role === 'owner') return -1;
        if (b.role === 'owner') return 1;
        return 0;
      });
      
      setTeamMembers(sorted);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="about-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading team information...</p>
        </div>
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="about-page">
        <div className="about-hero">
          <h1>About Us</h1>
          <p>Team information coming soon...</p>
        </div>
      </div>
    );
  }

  const owner = teamMembers.find(m => m.role === 'owner');
  const members = teamMembers.filter(m => m.role !== 'owner');

  return (
    <div className="about-page">
      {owner && (
        <div className="about-hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">{owner.name}</h1>
              {owner.status && <p className="hero-status">{owner.status}</p>}
              {owner.bio && <p className="hero-subtitle">{owner.bio}</p>}
            </div>
            {owner.profileImage && (
              <div className="hero-image">
                <img src={owner.profileImage} alt={owner.name} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="about-content">
        <div className="content-wrapper">
          {owner && (
            <>
              <h2 className="section-title">About the Founder</h2>
              <MemberCard member={owner} isOwner={true} />
            </>
          )}

          {members.length > 0 && (
            <>
              <h2 className="section-title">Our Team</h2>
              <div className="team-grid">
                {members.map((member) => (
                  <MemberCard key={member.$id} member={member} isOwner={false} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MemberCard = ({ member, isOwner }) => {
  return (
    <div className={`member-card ${isOwner ? 'owner-card' : ''}`}>
      {member.profileImage && (
        <div className="member-image">
          <img src={member.profileImage} alt={member.name} />
        </div>
      )}
      
      <div className="member-info">
        <h3 className="member-name">
          {member.name}
          {member.role === 'owner' && <span className="owner-badge">Founder</span>}
        </h3>
        
        {member.status && <p className="member-status">{member.status}</p>}
        {!isOwner && member.bio && <p className="member-bio">{member.bio}</p>}

        {member.currentProject && (
          <div className="current-project">
            <h4>Current Project</h4>
            <p>{member.currentProject}</p>
          </div>
        )}

        {member.skills && member.skills.length > 0 && (
          <div className="member-skills">
            <h4>Skills</h4>
            <div className="skills-grid">
              {member.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        <div className="member-contact">
          {member.email && (
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <a href={`mailto:${member.email}`}>{member.email}</a>
            </div>
          )}
          {member.phone && (
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <span>{member.phone}</span>
            </div>
          )}
          {member.location && (
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>{member.location}</span>
            </div>
          )}
        </div>

        {(member.github || member.linkedin) && (
          <div className="social-links">
            {member.github && (
              <a href={member.github} target="_blank" rel="noopener noreferrer" className="social-link">
                <span>🔗 GitHub</span>
              </a>
            )}
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                <span>💼 LinkedIn</span>
              </a>
            )}
          </div>
        )}

        {member.education && (
          <div className="member-section">
            <h4>Education</h4>
            <p className="section-text">{member.education}</p>
          </div>
        )}

        {member.experience && (
          <div className="member-section">
            <h4>Experience</h4>
            <p className="section-text">{member.experience}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
