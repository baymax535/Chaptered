import { useState, useEffect } from 'react';
import { checkApiStatus } from '../services/api';
import './home.css';

function Home() {
  const [apiStatus, setApiStatus] = useState({
    loaded: false,
    status: 'checking',
    error: null
  });

  useEffect(() => {
    checkApiStatus()
      .then(response => {
        setApiStatus({
          loaded: true,
          status: response.data.status,
          version: response.data.version,
          name: response.data.api_name,
          error: null
        });
      })
      .catch(error => {
        setApiStatus({
          loaded: true,
          status: 'error',
          error: 'Failed to connect to API. Make sure the backend is running.'
        });
      });
  }, []);

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>Welcome to Chaptered</h1>
        <p className="subtitle">Discover, Review, and Share Your Thoughts on Books & Movies</p>
        <a href="/books" className="cta-button">Explore Books</a>
        <a href="/movies" className="cta-button secondary">Explore Movies</a>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <h2>Browse</h2>
          <p>Explore our vast collection of books and movies.</p>
        </div>
        <div className="feature-card">
          <h2>Review</h2>
          <p>Share your thoughts and read what others think.</p>
        </div>
        <div className="feature-card">
          <h2>Save</h2>
          <p>Create your personal collections and wishlists.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;