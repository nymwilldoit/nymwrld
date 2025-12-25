import React, { useState } from 'react';
import { databases, DATABASE_ID, MESSAGES_COLLECTION_ID } from '../appwrite/config';
import { ID } from 'appwrite';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess(false);

    try {
      // Save message to Appwrite
      await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          subject: formData.subject || '',
          message: formData.message,
          status: 'unread'
        }
      );

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again or email us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1 className="hero-title">Get In Touch</h1>
          <p className="hero-subtitle">
            Have a question or want to work together? Send me a message!
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h2 className="section-heading">Let's Connect</h2>
              <p className="info-description">
                Feel free to reach out through any of the following channels. 
                I'll get back to you as soon as possible!
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">📧</div>
                  <div className="method-content">
                    <h3>Email</h3>
                    <a href="mailto:your.email@example.com">your.email@example.com</a>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📱</div>
                  <div className="method-content">
                    <h3>Phone</h3>
                    <a href="tel:+8801234567890">+880 1234-567890</a>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📍</div>
                  <div className="method-content">
                    <h3>Location</h3>
                    <p>Gazipur, Dhaka, Bangladesh</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="social-links">
                <h3>Follow Me</h3>
                <div className="social-icons">
                  <a 
                    href="https://github.com/yourusername" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-icon"
                    aria-label="GitHub"
                  >
                    <span>💻</span>
                  </a>
                  <a 
                    href="https://linkedin.com/in/yourusername" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-icon"
                    aria-label="LinkedIn"
                  >
                    <span>💼</span>
                  </a>
                  <a 
                    href="https://facebook.com/yourusername" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-icon"
                    aria-label="Facebook"
                  >
                    <span>📘</span>
                  </a>
                  <a 
                    href="https://twitter.com/yourusername" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-icon"
                    aria-label="Twitter"
                  >
                    <span>🐦</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <h2 className="section-heading">Send a Message</h2>

              {success && (
                <div className="alert alert-success">
                  <span className="alert-icon">✓</span>
                  <div>
                    <strong>Message sent successfully!</strong>
                    <p>Thank you for reaching out. I'll get back to you soon.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠</span>
                  <div>
                    <strong>Error sending message</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      Your Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      disabled={sending}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      disabled={sending}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+880 1234-567890"
                      disabled={sending}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject (Optional)</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Project Inquiry"
                      disabled={sending}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    Message <span className="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    rows="6"
                    required
                    disabled={sending}
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <span className="btn-spinner">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
