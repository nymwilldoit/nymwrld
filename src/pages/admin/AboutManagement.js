import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { account, databases, storage, DATABASE_ID, ABOUT_COLLECTION_ID, STORAGE_BUCKET_ID } from '../../appwrite/config';
import { ID, Query } from 'appwrite';
import './AboutManagement.css';

function AboutManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aboutId, setAboutId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    status: '',
    bio: '',
    currentProject: '',
    email: '',
    phone: '',
    location: '',
    github: '',
    linkedin: '',
    profileImage: '',
    skills: '',
    education: '',
    experience: '',
    imageFile: null
  });

  useEffect(() => {
    checkAuth();
    fetchAboutData();
  }, []);

  const checkAuth = async () => {
    try {
      await account.get();
    } catch (error) {
      navigate('/admin/login');
    }
  };

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        ABOUT_COLLECTION_ID,
        [Query.limit(1)]
      );

      if (response.documents.length > 0) {
        const data = response.documents[0];
        setAboutId(data.$id);
        setFormData({
          name: data.name || '',
          status: data.status || '',
          bio: data.bio || '',
          currentProject: data.currentProject || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          github: data.github || '',
          linkedin: data.linkedin || '',
          profileImage: data.profileImage || '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          education: data.education || '',
          experience: data.experience || '',
          imageFile: null
        });
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  const uploadImage = async (file) => {
    try {
      const response = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );
      const fileUrl = `${process.env.REACT_APP_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${response.$id}/view?project=${process.env.REACT_APP_APPWRITE_PROJECT_ID}`;
      return fileUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let profileImage = formData.profileImage;

      // Upload new image if selected
      if (formData.imageFile) {
        profileImage = await uploadImage(formData.imageFile);
      }

      // Prepare about data
      const aboutDataToSave = {
        name: formData.name,
        status: formData.status,
        bio: formData.bio,
        currentProject: formData.currentProject,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        github: formData.github,
        linkedin: formData.linkedin,
        profileImage: profileImage,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        education: formData.education,
        experience: formData.experience
      };

      if (aboutId) {
        // Update existing
        await databases.updateDocument(
          DATABASE_ID,
          ABOUT_COLLECTION_ID,
          aboutId,
          aboutDataToSave
        );
        alert('About section updated successfully!');
      } else {
        // Create new
        const response = await databases.createDocument(
          DATABASE_ID,
          ABOUT_COLLECTION_ID,
          ID.unique(),
          aboutDataToSave
        );
        setAboutId(response.$id);
        alert('About section created successfully!');
      }

      fetchAboutData();
    } catch (error) {
      console.error('Error saving about data:', error);
      alert('Error saving about data: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="about-management">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p className="loading-text">Loading about data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="about-management">
      {/* Page Header */}
      <section className="page-header">
        <div className="header-content">
          <h1 className="page-title">👤 Manage About Section</h1>
          <div className="header-actions">
            <Link to="/admin/dashboard" className="btn btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="content-section">
        <div className="about-form">
          <h2 className="form-title">Profile Information</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Basic Info */}
              <div className="form-section">
                <h3 className="section-heading">📝 Basic Information</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Current Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select status</option>
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Developer">Developer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio / About Me *</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Write about yourself, your background, interests, and goals..."
                    required
                    rows="6"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currentProject">Current Project</label>
                  <input
                    type="text"
                    id="currentProject"
                    name="currentProject"
                    value={formData.currentProject}
                    onChange={handleInputChange}
                    placeholder="What are you currently working on?"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="form-section">
                <h3 className="section-heading">📞 Contact Information</h3>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+880 1234-567890"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Dhaka, Bangladesh"
                  />
                </div>
              </div>

              {/* Social Media - Only GitHub and LinkedIn */}
              <div className="form-section">
                <h3 className="section-heading">🌐 Social Media Links</h3>
                
                <div className="form-group">
                  <label htmlFor="github">GitHub URL</label>
                  <input
                    type="url"
                    id="github"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="linkedin">LinkedIn URL</label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourusername"
                  />
                </div>
              </div>

              {/* Skills & Education */}
              <div className="form-section">
                <h3 className="section-heading">🎓 Skills & Education</h3>
                
                <div className="form-group">
                  <label htmlFor="skills">Skills</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="Python, Machine Learning, React, Data Science (comma separated)"
                  />
                  <small>Separate skills with commas</small>
                </div>

                <div className="form-group">
                  <label htmlFor="education">Education</label>
                  <textarea
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="Your educational background..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience">Experience</label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Your work experience, internships, projects..."
                    rows="4"
                  />
                </div>
              </div>

              {/* Profile Image */}
              <div className="form-section">
                <h3 className="section-heading">📷 Profile Image</h3>
                
                <div className="form-group">
                  <label htmlFor="image">Upload Profile Picture</label>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <small>PNG, JPG, or WEBP (Max 5MB)</small>
                  
                  {(formData.profileImage || formData.imageFile) && (
                    <div className="image-preview">
                      <img 
                        src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.profileImage} 
                        alt="Profile Preview" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save About Section'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AboutManagement;
