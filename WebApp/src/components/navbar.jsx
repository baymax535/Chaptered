// A Navigation bar to navigate between pages
import { Link } from 'react-router-dom'
import './navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Chaptered
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/books" className="nav-link">Books</Link>
          <Link to="/movies" className="nav-link">Movies</Link>
          <Link to="/login" className="nav-link login-button">Login</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar