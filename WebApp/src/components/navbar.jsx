import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle theme switch
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Chaptered</Link>

        {/* Desktop Navigation */}
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/books" className={`nav-link ${location.pathname === '/books' ? 'active' : ''}`}>Books</Link>
          <Link to="/movies" className={`nav-link ${location.pathname === '/movies' ? 'active' : ''}`}>Movies</Link>

          {/* Desktop Dropdown Menu (Fixed) */}
          <div className="nav-dropdown" ref={dropdownRef}>
            <button className="dropdown-btn" onClick={(e) => {
              e.stopPropagation(); // Prevents closing immediately
              setDropdownOpen((prev) => !prev);
            }}>
              Account ▼
            </button>
            <div className={`dropdown-content ${dropdownOpen ? 'show' : ''}`}>
              <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
              <Link to="/login" onClick={() => setDropdownOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setDropdownOpen(false)}>Register</Link>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="nav-controls">
          {/* Theme Toggle */}
          <div className="dark-mode-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? '🌙' : '☀️'}
          </div>

          {/* Mobile Menu Button */}
          <div className="menu-icon" onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
            setDropdownOpen(false); // Ensure dropdown resets when opening menu
          }}>
            ☰
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/books" onClick={() => setMobileMenuOpen(false)}>Books</Link>
          <Link to="/movies" onClick={() => setMobileMenuOpen(false)}>Movies</Link>

          {/* Mobile Dropdown Menu (Fixed) */}
          <div className="mobile-dropdown">
            <button className="dropdown-btn" onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
            }}>
              Account ▼
            </button>
            <div className={`dropdown-content ${dropdownOpen ? 'show' : ''}`}>
              <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
              <Link to="/login" onClick={() => setDropdownOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setDropdownOpen(false)}>Register</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
