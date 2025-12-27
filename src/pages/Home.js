import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import data from '../data/data.json';
import './Home.css';  // ← ADD THIS LINE

function Home() {
  useEffect(() => {
    // Initialize animations
    initScrollAnimations();
    animateCounters();
  }, []);

  const initScrollAnimations = () => {
    const elements = document.querySelectorAll('[data-aos]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
  };

  const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          const target = entry.target;
          const count = parseInt(target.getAttribute('data-count'));
          let current = 0;
          const increment = count / 50;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= count) {
              target.textContent = count + (count === 98 ? '%' : '+');
              clearInterval(timer);
            } else {
              target.textContent = Math.floor(current) + (count === 98 ? '%' : '+');
            }
          }, 40);
          
          target.classList.add('counted');
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            {data.hero.title} <span className="highlight">Solutions</span>
          </h1>
          <p className="hero-subtitle">{data.hero.subtitle}</p>
          <div className="hero-buttons">
            <Link to="/portfolio" className="btn btn-primary">
              View Projects →
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header" data-aos="fade-up">
          <span className="section-tag">What We Offer</span>
          <h2 className="section-title">Comprehensive solutions for environmental challenges</h2>
          <p className="section-description">
            Innovative approaches powered by cutting-edge technology and data science
          </p>
        </div>
        
        <div className="features-grid">
          {data.features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card" 
              data-aos="fade-up" 
              data-aos-delay={index * 100}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link to="/portfolio" className="feature-link">
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {data.stats.map((stat, index) => (
            <div key={index} className="stat-item" data-aos="fade-up" data-aos-delay={index * 100}>
              <div className="stat-number" data-count={stat.value}>0</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-section">
        <div className="section-header" data-aos="fade-up">
          <span className="section-tag">Technology</span>
          <h2 className="section-title">Modern tools for cutting-edge solutions</h2>
        </div>
        
        <div className="tech-grid" data-aos="fade-up" data-aos-delay="200">
          {data.techStack.map((tech, index) => (
            <div key={index} className="tech-item">
              {tech}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content" data-aos="fade-up">
          <h2>Let's work together to create innovative environmental solutions</h2>
          <p>Ready to start your next project? Get in touch today.</p>
          <Link to="/contact" className="btn btn-primary">
            Contact Us Today
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
