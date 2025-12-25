import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { account, databases, storage, DATABASE_ID, PROJECTS_COLLECTION_ID, STORAGE_BUCKET_ID } from '../../appwrite/config';
import { ID, Query } from 'appwrite';
import './ProjectsManagement.css';

function ProjectsManagement() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    details: '',
    imageUrl: '',
    imageFile: null
  });

  useEffect(() => {
    checkAuth();
    fetchProjects();
  }, []);

  const checkAuth = async () => {
    try {
      await account.get();
    } catch (error) {
      navigate('/admin/login');
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
      );
      setProjects(response.documents);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Error loading projects');
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
    setUploading(true);

    try {
      let imageUrl = formData.imageUrl;

      // Upload new image if selected
      if (formData.imageFile) {
        imageUrl = await uploadImage(formData.imageFile);
      }

      // Prepare project data
      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        details: formData.details,
        imageUrl: imageUrl
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

      // Reset form and refresh
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await databases.deleteDocument(DATABASE_ID, PROJECTS_COLLECTION_ID, id);
      alert('Project deleted successfully!');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: '',
      details: '',
      imageUrl: '',
      imageFile: null
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="projects-management">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p className="loading-text">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-management">
      {/* Page Header */}
      <section className="page-header">
        <div className="header-content">
          <h1 className="page-title">📁 Manage Projects</h1>
          <div className="header-actions">
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)} 
                className="btn btn-primary"
              >
                + Add New Project
              </button>
            )}
            <Link to="/admin/dashboard" className="btn btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="content-section">
        {/* Project Form */}
        {showForm && (
          <div className="project-form">
            <h2 className="form-title">
              {editingId ? 'Edit Project' : 'Add New Project'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Project Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Research">Research</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Short Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description (1-2 sentences)"
                    required
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="details">Full Details *</label>
                  <textarea
                    id="details"
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    placeholder="Detailed project description, methodology, results, etc."
                    required
                    rows="6"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tags">Tags</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Python, React, TensorFlow (comma separated)"
                  />
                  <small>Separate tags with commas</small>
                </div>

                <div className="form-group">
                  <label htmlFor="image">Project Image</label>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <small>PNG, JPG, or WEBP (Max 5MB)</small>
                  
                  {(formData.imageUrl || formData.imageFile) && (
                    <div className="image-preview">
                      <img 
                        src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl} 
                        alt="Preview" 
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-submit"
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="btn btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No Projects Yet</h3>
            <p>Add your first project to get started!</p>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                + Add New Project
              </button>
            )}
          </div>
        ) : (
          <div className="projects-list">
            {projects.map(project => (
              <div key={project.$id} className="project-card">
                <div className="project-image-container">
                  {project.imageUrl ? (
                    <img 
                      src={project.imageUrl} 
                      alt={project.title}
                      className="project-image"
                    />
                  ) : (
                    <div className="project-placeholder">📁</div>
                  )}
                </div>

                <div className="project-info">
                  <div className="project-header">
                    <h3 className="project-title">{project.title}</h3>
                    <span className="project-category">{project.category}</span>
                  </div>

                  <p className="project-description">{project.description}</p>

                  {project.tags && project.tags.length > 0 && (
                    <div className="project-tags">
                      {project.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="project-actions">
                    <button 
                      onClick={() => handleEdit(project)}
                      className="btn btn-small btn-edit"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(project.$id)}
                      className="btn btn-small btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectsManagement;
