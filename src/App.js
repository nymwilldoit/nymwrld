import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import ProjectDetail from './pages/ProjectDetail';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProjectsManagement from './pages/admin/ProjectsManagement';
import AboutManagement from './pages/admin/AboutManagement';
import MessagesManagement from './pages/admin/MessagesManagement';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/projects" element={<ProjectsManagement />} />
            <Route path="/admin/about" element={<AboutManagement />} />
            <Route path="/admin/messages" element={<MessagesManagement />} />

            {/* Redirect /admin to login */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

            {/* 404 - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
