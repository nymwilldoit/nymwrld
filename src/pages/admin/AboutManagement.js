import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  account, 
  databases, 
  storage, 
  DATABASE_ID, 
  ABOUT_COLLECTION_ID, 
  STORAGE_BUCKET_ID,
  Query,
  isOwner,
  getCurrentUser,
  OWNER_USER_ID
} from '../../appwrite/config';
import { ID } from 'appwrite';
import './AboutManagement.css';

const AboutManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isUserOwner, setIsUserOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [imageFile, setImageFile] = useState(null);

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
    role: 'member',
    isActive: true,
    userId: ''
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/admin/login');
        return;
      }

      setUser(currentUser);
      const ownerStatus = await isOwner();
      setIsUserOwner(ownerStatus);

      // Set default userId
      setFormData(prev => ({ ...prev, userId: currentUser.$id }));

      await fetchTeamMembers(currentUser.$id, ownerStatus);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (userId, ownerStatus) => {
    try {
      let queries = [Query.orderDesc('$createdAt')];
      
      if (!ownerStatus) {
        queries.push(Query.equal('userId', userId));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        ABOUT_COLLECTION_ID,
        queries
      );

      setTeamMembers(response.documents);

      if (response.documents.length > 0) {
        const ownProfile = response.documents.find(doc => doc.userId === userId);
        selectMember(ownProfile || response.documents[0]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setMessage('Error loading profiles');
    }
  };

  const selectMember = (member) => {
    if (!member) return;

    setSelectedMember(member);
    setFormData({
      name: member.name || '',
      status: member.status || '',
      bio: member.bio || '',
      currentProject: member.currentProject || '',
      email: member.email || '',
      phone: member.phone || '',
      location: member.location || '',
      github: member.github || '',
      linkedin: member.linkedin || '',
      profileImage: member.profileImage || '',
      skills: Array.isArray(member.skills) ? member.skills.join(', ') : '',
      education: member.education || '',
      experience: member.experience || '',
      role: member.role || 'member',
      isActive: member.isActive !== undefined ? member.isActive : true,
      userId: member.userId || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return formData.profileImage;

    try {
      const response = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        imageFile
      );

      const fileUrl = `${process.env.REACT_APP_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${response.$id}/view?project=${process.env.REACT_APP_APPWRITE_PROJECT_ID}`;
      
      return fileUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedMember && selectedMember.userId !== user.$id && !isUserOwner) {
      setMessage('❌ You can only edit your own profile');
      return;
    }

    if (!formData.userId) {
      setMessage('❌ User ID is required');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      let imageUrl = formData.profileImage;
      
      if (imageFile) {
        imageUrl = await handleImageUpload();
      }

      const skillsArray = formData.skills
        ? formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];

      const aboutData = {
        name: formData.name,
        status: formData.status,
        bio: formData.bio,
        currentProject: formData.currentProject,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        github: formData.github,
        linkedin: formData.linkedin,
        profileImage: imageUrl,
        skills: skillsArray,
        education: formData.education,
        experience: formData.experience,
        userId: formData.userId,
        role: isUserOwner ? formData.role : 'member',
        isActive: formData.isActive
      };

      if (selectedMember) {
        await databases.updateDocument(
          DATABASE_ID,
          ABOUT_COLLECTION_ID,
          selectedMember.$id,
          aboutData
        );
        setMessage('✅ Profile updated successfully!');
      } else {
        await databases.createDocument(
          DATABASE_ID,
          ABOUT_COLLECTION_ID,
          ID.unique(),
          aboutData
        );
        setMessage('✅ Profile created successfully!');
      }

      setImageFile(null);
      await fetchTeamMembers(user.$id, isUserOwner);
    } catch (error) {
      console.error('Error saving:', error);
      setMessage('❌ Error saving profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedMember(null);
    setFormData({
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
      role: 'member',
      isActive: true,
      userId: user.$id
    });
    setImageFile(null);
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;

    const memberToDelete = teamMembers.find(m => m.$id === memberId);
    
    if (memberToDelete.userId !== user.$id && !isUserOwner) {
      setMessage('❌ You can only delete your own profile');
      return;
    }

    try {
      await databases.deleteDocument(DATABASE_ID, ABOUT_COLLECTION_ID, memberId);
      setMessage('✅ Profile deleted successfully!');
      await fetchTeamMembers(user.$id, isUserOwner);
      
      if (selectedMember?.$id === memberId) {
        handleCreateNew();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage('❌ Error deleting profile');
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Manage Team Profiles</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="admin-content">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Team Members</h3>
            <button onClick={handleCreateNew} className="create-button">
              + New Profile
            </button>
          </div>

          <div className="members-list">
            {teamMembers.length === 0 ? (
              <p className="no-members">No profiles yet. Create one!</p>
            ) : (
              teamMembers.map((member) => (
                <div
                  key={member.$id}
                  className={`member-item ${selectedMember?.$id === member.$id ? 'active' : ''} ${member.role === 'owner' ? 'owner-item' : ''}`}
                  onClick={() => selectMember(member)}
                >
                  <div className="member-item-content">
                    {member.profileImage && (
                      <img
                        src={member.profileImage}
                        alt={member.name}
                        className="member-avatar"
                      />
                    )}
                    <div>
                      <h4 className="member-item-name">
                        {member.name}
                        {member.role === 'owner' && <span className="owner-badge">Owner</span>}
                      </h4>
                      <p className="member-item-status">{member.status}</p>
                    </div>
                  </div>
                  {(isUserOwner || member.userId === user.$id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(member.$id);
                      }}
                      className="delete-button"
                      title="Delete profile"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-container">
          <h2 className="form-title">
            {selectedMember ? 'Edit Profile' : 'Create New Profile'}
          </h2>

          <form onSubmit={handleSubmit} className="about-form">
            {/* User Assignment - NEW SECTION */}
            {isUserOwner && (
              <div className="form-section">
                <h3 className="section-title">User Assignment</h3>
                
                <div className="form-group">
                  <label className="form-label">User ID *</label>
                  <input
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    required
                    disabled={!!selectedMember}
                    className="form-input"
                    placeholder="Appwrite User ID"
                  />
                  <small className="form-hint">
                    {selectedMember 
                      ? 'User ID cannot be changed after creation' 
                      : `Current user: ${user.$id} (you can change this to assign to another user)`
                    }
                  </small>
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Status/Title *</label>
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="e.g., ML Engineer, Data Scientist"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio *</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="form-textarea"
                  placeholder="Write a brief bio..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Project</label>
                <input
                  type="text"
                  name="currentProject"
                  value={formData.currentProject}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="What are you working on?"
                />
              </div>

              {isUserOwner && (
                <>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="member">Team Member</option>
                      <option value="owner">Owner/Founder</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="form-checkbox"
                      />
                      <span>Active (show on About page)</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Contact Info */}
            <div className="form-section">
              <h3 className="section-title">Contact Information</h3>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="+880 1234-567890"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Social Media - ONLY GitHub and LinkedIn */}
            <div className="form-section">
              <h3 className="section-title">Social Media</h3>

              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            {/* Profile Image */}
            <div className="form-section">
              <h3 className="section-title">Profile Image</h3>

              {formData.profileImage && (
                <div className="image-preview">
                  <img
                    src={formData.profileImage}
                    alt="Current profile"
                    className="preview-image"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Upload New Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                {imageFile && <p className="file-name">Selected: {imageFile.name}</p>}
              </div>
            </div>

            {/* Skills */}
            <div className="form-section">
              <h3 className="section-title">Skills & Expertise</h3>

              <div className="form-group">
                <label className="form-label">Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Python, Machine Learning, React, Data Science"
                />
                <small className="form-hint">Separate skills with commas</small>
              </div>
            </div>

            {/* Education & Experience */}
            <div className="form-section">
              <h3 className="section-title">Background</h3>

              <div className="form-group">
                <label className="form-label">Education</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-textarea"
                  placeholder="Your educational background..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience</label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-textarea"
                  placeholder="Your work experience..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="submit-button"
            >
              {saving ? 'Saving...' : (selectedMember ? 'Update Profile' : 'Create Profile')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AboutManagement;
