import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  account, 
  databases, 
  storage,
  DATABASE_ID, 
  PROJECTS_COLLECTION_ID,
  STORAGE_BUCKET_ID 
} from '../../appwrite/config';
import { ID, Query } from 'appwrite';
import './ProjectsManagement.css';

function ProjectsManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Machine Learning',
    tags: '',
    details: '',
    imageUrl: '',
    imageFile: null
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchProjects();
  }, []);

  // Check authentication
  const checkAuth = async () => {
    try {
      await account.get();
    } catch (error) {
      navigate('/admin/login');
    }
  };

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
      );
      setProjects(response.documents);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload to Appwrite Storage
  const handleImageUpload = async (file) => {
    if (!file) return null;

    try {
      setUploading(true);
      
      // Upload file to Appwrite Storage
      const response = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );

      // Get file URL
      const fileUrl = storage.getFileView(STORAGE_BUCKET_ID, response.$id);
      
      console.log('Image uploaded:', fileUrl);
      return fileUrl.href; // Return the URL as string
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Handle form submit (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Upload image if new file selected
      let imageUrl = formData.imageUrl;
      if (formData.imageFile) {
        const uploadedUrl = await handleImageUpload(formData.imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

// Prepare project data
const projectData = {
  title: formData.title,
  description: formData.description,
  category: formData.category,
  tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
  details: formData.details,
  imageUrl: imageUrl,
  createdAt: new Date().toISOString()  // ← ADD THIS LINE
};


      if (editingId) {
        // Update existing project
        await databases.updateDocument(
          DATABASE_ID,
          PROJECTS_COLLECTION_ID,
          editingId,
          projectData
        );
        alert('Project updated successfully!');
      } else {
        // Create new project
        await databases.createDocument(
          DATABASE_ID,
          PROJECTS_COLLECTION_ID,
          ID.unique(),
          projectData
        );
        alert('Project added successfully!');
      }

      // Reset form and refresh projects
      resetForm();
      fetchProjects();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project: ' + error.message);
    }
  };

  // Handle edit
  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      tags: project.tags.join(', '),
      details: project.details,
      imageUrl: project.imageUrl,
      imageFile: null
    });
    setEditingId(project.$id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        id
      );
      alert('Project deleted successfully!');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Machine Learning',
      tags: '',
      details: '',
      imageUrl: '',
      imageFile: null
    });
    setEditingId(null);
  };

  // Cancel form
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">⏳</div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="projects-management">
      {/* Header */}
      <header className="management-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📂 Projects Management</h1>
            <span className="project-count">{projects.length} projects</span>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
            <span>←</span> Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="management-content">
        <div className="container">
          {/* Action Bar */}
          <div className="action-bar">
            <button 
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }} 
              className="add-btn"
            >
              {showForm ? (
                <><span>✕</span> Cancel</>
              ) : (
                <><span>+</span> Add New Project</>
              )}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="project-form-container">
              <div className="form-header">
                <h2>{editingId ? '✏️ Edit Project' : '➕ Add New Project'}</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="project-form">
                {/* Title */}
                <div className="form-group full-width">
                  <label htmlFor="title">
                    Project Title <span className="required">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., River Flood Prediction System"
                    required
                  />
                </div>

                {/* Description */}
                <div className="form-group full-width">
                  <label htmlFor="description">
                    Short Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief overview of the project (2-3 sentences)"
                    rows="3"
                    required
                  />
                </div>

                {/* Category and Tags Row */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">
                      Category <span className="required">*</span>
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Data Visualization">Data Visualization</option>
                      <option value="GIS">GIS</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="IoT">IoT</option>
                      <option value="Web Development">Web Development</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tags">
                      Tags <span className="required">*</span>
                    </label>
                    <input
                      id="tags"
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="Python, TensorFlow, React (comma separated)"
                      required
                    />
                  </div>
                </div>

                {/* Full Details */}
                <div className="form-group full-width">
                  <label htmlFor="details">
                    Full Project Details <span className="required">*</span>
                  </label>
                  <textarea
                    id="details"
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                    placeholder="Detailed description, features, technologies used, outcomes, etc."
                    rows="8"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="form-group full-width">
                  <label htmlFor="image">
                    Project Image
                  </label>
                  <div className="image-upload-area">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Check file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            alert('Image size should be less than 5MB');
                            e.target.value = '';
                            return;
                          }
                          setFormData({...formData, imageFile: file});
                        }
                      }}
                      disabled={uploading}
                    />
                    {uploading && <p className="upload-status">⏳ Uploading image...</p>}
                    {formData.imageUrl && !formData.imageFile && (
                      <div className="current-image">
                        <p>Current image:</p>
                        <img src={formData.imageUrl} alt="Current" />
                      </div>
                    )}
                    {formData.imageFile && (
                      <p className="file-selected">✓ New file selected: {formData.imageFile.name}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  <button type="button" onClick={handleCancel} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" disabled={uploading} className="submit-btn">
                    {uploading ? 'Uploading...' : editingId ? 'Update Project' : 'Add Project'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Projects List */}
          <div className="projects-list-container">
            <div className="list-header">
              <h2>All Projects</h2>
            </div>

            {projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No projects yet</h3>
                <p>Click "Add New Project" to create your first project!</p>
              </div>
            ) : (
              <div className="projects-list">
                {projects.map((project) => (
                  <div key={project.$id} className="project-item">
                    {project.imageUrl && (
                      <div className="project-thumbnail">
                        <img src={project.imageUrl} alt={project.title} />
                      </div>
                    )}
                    
                    <div className="project-info">
                      <h3>{project.title}</h3>
                      <span className="project-category">{project.category}</span>
                      <p className="project-description">{project.description}</p>
                      <div className="project-tags">
                        {project.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                      <div className="project-meta">
                        <span>Created: {new Date(project.$createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="project-actions">
                      <button 
                        onClick={() => handleEdit(project)} 
                        className="edit-btn"
                        title="Edit project"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(project.$id)} 
                        className="delete-btn"
                        title="Delete project"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProjectsManagement;
