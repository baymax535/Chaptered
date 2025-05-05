import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleStorage = () => setIsLoggedIn(!!localStorage.getItem('access_token'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('access_token'));
  }, [location]);

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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Chaptered</Link>

        {/* Desktop Navigation */}
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/books" className={`nav-link ${location.pathname === '/books' ? 'active' : ''}`}>Books</Link>
          <Link to="/movies" className={`nav-link ${location.pathname === '/movies' ? 'active' : ''}`}>Movies</Link>

          {/* Desktop Dropdown Menu */}
          <div className="nav-dropdown" ref={dropdownRef}>
            <button className="dropdown-btn" onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
            }}>
              Account ▼
            </button>
            <div className={`dropdown-content ${dropdownOpen ? 'show' : ''}`}>
              {isLoggedIn ? (
                <>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
                  <button style={{background: 'none', border: 'none', textAlign: 'left', padding: '12px', fontSize: '14px', cursor: 'pointer', color: 'inherit'}} onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setDropdownOpen(false)}>Login</Link>
                  <Link to="/register" onClick={() => setDropdownOpen(false)}>Register</Link>
                </>
              )}
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
            setDropdownOpen(false);
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
          <div className="mobile-dropdown">
            <button className="dropdown-btn" onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
            }}>
              Account ▼
            </button>
            <div className={`dropdown-content ${dropdownOpen ? 'show' : ''}`}>
              {isLoggedIn ? (
                <>
                  <Link to="/profile" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Profile</Link>
                  <button style={{background: 'none', border: 'none', textAlign: 'left', padding: '12px', fontSize: '14px', cursor: 'pointer', color: 'inherit'}} onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Login</Link>
                  <Link to="/register" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
