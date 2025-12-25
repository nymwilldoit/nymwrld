import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { account, databases, DATABASE_ID, MESSAGES_COLLECTION_ID } from '../../appwrite/config';
import { Query } from 'appwrite';
import './MessagesManagement.css';

function MessagesManagement() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    checkAuth();
    fetchMessages();
  }, []);

  const checkAuth = async () => {
    try {
      await account.get();
    } catch (error) {
      navigate('/admin/login');
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
      );
      setMessages(response.documents);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        id,
        { status: 'read' }
      );
      fetchMessages();
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await databases.deleteDocument(DATABASE_ID, MESSAGES_COLLECTION_ID, id);
      alert('Message deleted successfully!');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message');
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return msg.status === 'unread';
    if (filter === 'read') return msg.status === 'read';
    return true;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (loading) {
    return (
      <div className="messages-management">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p className="loading-text">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-management">
      {/* Page Header */}
      <section className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">💬 Contact Messages</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </div>
          <div className="header-actions">
            <Link to="/admin/dashboard" className="btn btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="content-section">
        {/* Filter Buttons */}
        <div className="filter-section">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({messages.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>

        {/* Messages List */}
        {filteredMessages.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No Messages</h3>
            <p>
              {filter === 'unread' 
                ? 'No unread messages at the moment.'
                : filter === 'read'
                ? 'No read messages yet.'
                : 'No messages received yet.'}
            </p>
          </div>
        ) : (
          <div className="messages-list">
            {filteredMessages.map(message => (
              <div 
                key={message.$id} 
                className={`message-card ${message.status === 'unread' ? 'unread' : ''}`}
              >
                <div className="message-header">
                  <div className="sender-info">
                    <h3 className="sender-name">{message.name}</h3>
                    <span className="sender-email">{message.email}</span>
                    {message.phone && (
                      <span className="sender-phone">📞 {message.phone}</span>
                    )}
                  </div>
                  <div className="message-meta">
                    <span className={`status-badge ${message.status}`}>
                      {message.status === 'unread' ? '🔵 New' : '✓ Read'}
                    </span>
                    <span className="message-date">
                      {new Date(message.$createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {message.subject && (
                  <h4 className="message-subject">
                    Subject: {message.subject}
                  </h4>
                )}

                <p className="message-content">{message.message}</p>

                <div className="message-actions">
                  <a 
                    href={`mailto:${message.email}`}
                    className="btn btn-small btn-reply"
                  >
                    ↩️ Reply
                  </a>
                  {message.status === 'unread' && (
                    <button 
                      onClick={() => markAsRead(message.$id)}
                      className="btn btn-small btn-mark-read"
                    >
                      ✓ Mark as Read
                    </button>
                  )}
                  <button 
                    onClick={() => deleteMessage(message.$id)}
                    className="btn btn-small btn-delete"
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
  );
}

export default MessagesManagement;
